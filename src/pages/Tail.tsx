import React, { useEffect, useState } from 'react';
import { useParams, Link } from "react-router-dom";
import '../App.css';
import Layout from '../Layout';

function Tail() {
    const { hash } = useParams();
    const [tail, setTail] = useState({ hash: '', name: '', code: '', category: '', description: '', launcherId: '', eveCoinId: '' });
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [tailReveal, setTailReveal] = useState('');

    useEffect(() => {
        window.taildatabase.getTail(hash || '')
            .then(res => {
                setTail(res);

                return Promise.all([
                    window.taildatabase.getTailReveal(res.eveCoinId),
                    window.taildatabase.getNftUri(res.launcherId)
                ]);
            })
            .then(([[eve_coin_id, _, tail_reveal], url]) => {
                setLogoUrl(url);
                setTailReveal(tail_reveal);
            })
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
                <p>Eve coin id: {tail.eveCoinId}</p>
                <p>TAIL reveal: {tailReveal}</p>
                {logoUrl && (<img src={logoUrl} />)}
            </div>
        </Layout>
    );
}

export default Tail;
