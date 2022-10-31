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
            <div className="row">
                <div className="col-md-12">
                    <table className="table">
                        <thead>
                            <tr>
                                <td colSpan={2}>
                                    <h1>{tail.name}</h1>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={{ textAlign: 'center'}}>
                                    {logoUrl && (<img src={logoUrl} style={{ width: '15em' }} />)}
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Hash</td>
                                <td>{tail.hash}</td>
                            </tr>
                            <tr>
                                <td>Code</td>
                                <td>{tail.code}</td>
                            </tr>
                            <tr>
                                <td>Category</td>
                                <td>{tail.category}</td>
                            </tr>
                            <tr>
                                <td>Description</td>
                                <td>{tail.description}</td>
                            </tr>
                            <tr>
                                <td>Eve coin id</td>
                                <td>{tail.eveCoinId}</td>
                            </tr>
                            <tr>
                                <td>TAIL reveal</td>
                                <td>
                                    <div style={{ width: '35em', overflowX: 'auto' }}>{tailReveal}</div></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}

export default Tail;
