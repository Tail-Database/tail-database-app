import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import '../App.css';
import Layout from '../Layout';



function AddTail() {
    const [tail, setTail] = useState({ hash: '', name: '', code: ''});

    useEffect(() => {
    }, []);


    return (
        <Layout>
            <div className="tail-info">
                <h1>Add CAT TAIL</h1>
                <p>Hash: xxx</p>
                <p>Code: xxx</p>
            </div>
        </Layout>
    );
}

export default AddTail;
