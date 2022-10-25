import React, { useEffect, useState } from 'react';
import { useParams, Link } from "react-router-dom";
import '../App.css';
import Layout from '../Layout';



function Tail() {
    const { hash } = useParams();
    const [tail, setTail] = useState({ hash: '', name: '', code: '', category: '', description: '' });

    useEffect(() => {
        window.taildatabase.getTail(hash || '')
            .then((res: any) => setTail(res))
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
            </div>
        </Layout>
    );
}

export default Tail;
