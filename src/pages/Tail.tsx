import React, { useEffect, useState } from 'react';
import { useParams, Link } from "react-router-dom";
import '../App.css';
import Layout from '../Layout';

function Tail() {
    const { hash } = useParams();
    const [tail, setTail] = useState({ hash: '', name: '', code: '', category: '', description: '', launcherId: '' });
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        window.taildatabase.getTail(hash || '')
            .then((res: any) => {
                setTail(res);

                return window.taildatabase.getNftUri(res.launcherId);
            })
            .then((url) => setLogoUrl(url))
            .catch(console.error)
    }, []);


    return (
        <Layout>
            <div className="tail-info">
                <h1>{tail.name}</h1>
                <p>Hash: {tail.hash}</p>
                <p>Code: {tail.code}</p>
                <p>Category: {tail.category}</p>
                <p>Description: {tail.description}</p>
                {logoUrl && (<img src={logoUrl} />)}
            </div>
        </Layout>
    );
}

export default Tail;
