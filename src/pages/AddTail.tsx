import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import '../App.css';
import Layout from '../Layout';



function AddTail() {
    const [hash, setHash] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
    }, []);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Todo: validate hash, name code
        if (hash.length !== 64) {
            console.error('hash.length !== 64');
            return;
        }

        if (name.length < 1 || name.length > 100) {
            console.error('name.length < 1 || name.length > 100');
            return;
        }

        if (code.length <1 || code.length > 5) {
            console.error('code.length <1 || code.length > 5');
            return;
        }

        try {
            const { tx_id } = await window.taildatabase.addTail({
                hash,
                name,
                code,
                category,
                description
            });

            console.log(hash, name, code, tx_id)
        } catch (err) {
            console.error(err);
        }
    };

    const onHashChange = (event: React.ChangeEvent<HTMLInputElement>) => setHash(event.target.value);
    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value);
    const onCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => setCode(event.target.value);
    const onCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => setCategory(event.target.value);
    const onDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => setDescription(event.target.value);

    return (
        <Layout>
            <div className="tail-info">
                <h1>Add CAT TAIL</h1>
                <form id="form-add-tail" onSubmit={onSubmit}>
                    <p>Hash: <input type="text" name="hash" onChange={onHashChange} /></p>
                    <p>Name: <input type="text" name="name" onChange={onNameChange} /></p>
                    <p>Code: <input type="text" name="code" onChange={onCodeChange} /></p>
                    <p>Category: <input type="text" name="category" onChange={onCategoryChange} /></p>
                    <p>Description: <input type="text" name="description" onChange={onDescriptionChange} /></p>
                    <input type="submit" value="Add TAIL" />
                </form>
            </div>
        </Layout>
    );
}

export default AddTail;
