import { Bytes, SExp, Stream, sexp_from_stream, h, to_sexp_f } from 'clvm';



export const hex_to_program = (hex: string): SExp => {
  const stream = new Stream(h(hex));

  stream.seek = 0;

  return sexp_from_stream(stream, to_sexp_f);
};

const ATOM_MATCH = hex_to_program('24');
const SEXP_MATCH = hex_to_program('3a');
const UNCURRY_PATTERN_FUNCTION = hex_to_program(
  'ff02ffff01ff3a8866756e6374696f6effff3a84636f726580',
);
const UNCURRY_PATTERN_CORE = hex_to_program(
  'ff04ffff01ff3a847061726dffff3a84636f726580',
);

/**
   * Try to add a new binding to the list, rejecting it if it conflicts
   * with an existing binding.
   */
 const unify_bindings = (bindings: Record<string, string>, atom: Bytes, new_value: string) => {
  const new_key: string = atom.decode();

  if (bindings[new_key]) {
    return bindings[new_key] === new_value ? bindings : null;
  }

  const new_bindings = {
    ...bindings,
    [new_key]: new_value,
  };

  return new_bindings;
}

/**
   * Determine if sexp matches the pattern, with the given known bindings already applied.
   *
   * Returns None if no match, or a (possibly empty) dictionary of bindings if there is a match
   *
   * Patterns look like this:
   * ($ . $) matches the literal "$", no bindings (mostly useless)
   * (: . :) matches the literal ":", no bindings (mostly useless)
   * ($ . A) matches B iff B is an atom; and A is bound to B
   * (: . A) matches B always; and A is bound to B
   * (A . B) matches (C . D) iff A matches C and B matches D
   *
   * and bindings are the unification (as long as unification is possible)
   */
 const match = (pattern: SExp, sexp: SExp, known_bindings = {}): Record<string, string> | null => {
  if (!pattern.listp()) {
    if (sexp.listp()) {
      return null;
    }

    return pattern.atom?.equal_to(sexp.atom) ? known_bindings : null;
  }

  const left = pattern.first();
  const right = pattern.rest();
  const atom = sexp.atom;

  if (ATOM_MATCH.equal_to(left)) {
    if (sexp.listp()) {
      return null;
    }

    if (ATOM_MATCH.equal_to(right)) {
      return ATOM_MATCH.equal_to(atom) ? {} : null;
    }

    return unify_bindings(
      known_bindings,
      right.atom as Bytes,
      sexp.toString(),
    );
  }

  if (SEXP_MATCH.equal_to(left)) {
    if (SEXP_MATCH.equal_to(right)) {
      return SEXP_MATCH.equal_to(atom) ? {} : null;
    }

    return unify_bindings(
      known_bindings,
      right.atom as Bytes,
      sexp.toString(),
    );
  }

  if (!sexp.listp()) {
    return null;
  }

  const new_bindings = match(left, sexp.first(), known_bindings);

  return new_bindings ? match(right, sexp.rest(), new_bindings) : null;
}

export const uncurry = (puzzle: SExp): [string, string[]] | null => {
  const args: string[] = [];
  let r = match(UNCURRY_PATTERN_FUNCTION, puzzle);

  if (!r) {
    return null;
  }

  const f = hex_to_program(r.function);
  let core = hex_to_program(r.core);

  while (true) {
    r = match(UNCURRY_PATTERN_CORE, core);

    if (!r) {
      break;
    }

    const parm = hex_to_program(r.parm);

    args.push(parm.atom ? parm.atom.hex() : parm.toString());

    core = hex_to_program(r.core);
  }

  if (core.toString() === '01') {
    return [f.toString(), args];
  }

  return null;
};
