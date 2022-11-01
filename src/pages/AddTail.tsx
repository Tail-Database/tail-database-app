import React, { useEffect, useState } from 'react';
import '../App.css';
import Layout from '../Layout';
import { convertbits, decode } from '../chia/bech32';
import { TailRecord } from '../models/tail/record';


function AddTail() {
    const [hash, setHash] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [logoNftId, setLogoNftId] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [coinId, setCoinId] = useState('');
    const [inserted, setInserted] = useState(false);
    const [failedMessage, setFailedMessage] = useState('');
    const [launcherId, setLauncherId] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        // When logo is correct length we check if it is a valid nft id
        // iff it's valid we resolve the NFT image and display it inline
        if (logoNftId.length !== 62) {
            setLauncherId(null);
            setLogoUrl(null);
            return
        }

        // bech32m decode nft id to coin id
        const decode_result = decode(logoNftId, 'bech32m');

        // Check for valid bech32m decode
        if (decode_result) {
            const launcher_id_raw = convertbits(decode_result.data, 5, 8, false);
            
            // Check for successful bit conversion
            if (launcher_id_raw) {
                const launcher_id = launcher_id_raw.map(n => n.toString(16).padStart(2, '0')).join('');

                window.taildatabase.getNftUri(launcher_id).then((url) => {
                    setLauncherId(launcher_id);
                    setLogoUrl(url);
                })
            }
            
        }
        
    }, [logoNftId]);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (hash.length !== 64) {
            console.error('hash.length !== 64');
            return;
        }

        if (name.length < 1 || name.length > 100) {
            console.error('name.length < 1 || name.length > 100');
            return;
        }

        if (code.length < 1 || code.length > 5) {
            console.error('code.length <1 || code.length > 5');
            return;
        }

        if (!launcherId || launcherId.length !== 64) {
            console.error('!launcherId || launcherId.length !== 64');
            return;
        }

        if (coinId.length !== 64) {
            console.error('coinId.length !== 64');
            return;
        }

        let eveCoinId = null;

        try {
            const [eve_coin_id, tail_hash] = await window.taildatabase.getTailReveal(coinId);

            if (tail_hash !== hash) {
                console.error(`tail_hash !== hash ${tail_hash} !== ${hash}`);
                setInserted(false);
                setFailedMessage(`Coin ID is not for correct type of CAT`);
                return;
            }

            eveCoinId = eve_coin_id;
        } catch (err) {
            console.error(err);
            setInserted(false);
            setFailedMessage(`Error with passed Coin ID: ${err}`);
            return;
        }

        try {
            const { tx_id } = await window.taildatabase.addTail({
                hash,
                name,
                code,
                category,
                description,
                launcherId,
                eveCoinId
            });

            if (tx_id) {
                setInserted(true);
                setFailedMessage('');
            } else {
                setInserted(false);
                setFailedMessage('Failed to submit TAIL record to mempool. You can only submit the same TAIL hash once. If you recently submitted a record you must wait for it to clear before submitting another.');
            }

            console.log(hash, name, code, tx_id)
        } catch (err) {
            console.error(err);
        }
    };

    const onHashChange = (event: React.ChangeEvent<HTMLInputElement>) => setHash(event.target.value);
    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value);
    const onCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => setCode(event.target.value);
    const onLogoNftIdChange = (event: React.ChangeEvent<HTMLInputElement>) => setLogoNftId(event.target.value);
    const onCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => setCategory(event.target.value);
    const onDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => setDescription(event.target.value);
    const onCoinIdChange = (event: React.ChangeEvent<HTMLInputElement>) => setCoinId(event.target.value);

    return (
        <Layout>
            <div className="tail-info">
                <h1>Add CAT TAIL</h1>
                {inserted && (
                    <>TAIL record submitted to mempool</>
                )}
                {!inserted && (
                    <form id="form-add-tail" onSubmit={onSubmit}>
                        <p>Hash: <input type="text" name="hash" onChange={onHashChange} /></p>
                        <p>Name: <input type="text" name="name" onChange={onNameChange} /></p>
                        <p>Code: <input type="text" name="code" onChange={onCodeChange} /></p>
                        <p>Logo NFT ID: <input type="text" name="logo-nft-id" onChange={onLogoNftIdChange} /></p>
                        <p>Category: <input type="text" name="category" onChange={onCategoryChange} /></p>
                        <p>Description: <input type="text" name="description" onChange={onDescriptionChange} /></p>
                        <p>CAT Coin ID: <input type="text" name="coin-id" onChange={onCoinIdChange} /></p>
                        <p><small>Provide the coin id of any coin that is of this CAT. This is used to find the TAIL reveal.</small></p>
                        <input type="submit" value="Add TAIL" />
                        {logoUrl && <img src={logoUrl} />}
                    </form>
                )}
                {failedMessage && (
                    <>{failedMessage}</>
                )}

            </div>
        </Layout>
    );
}

export default AddTail;
