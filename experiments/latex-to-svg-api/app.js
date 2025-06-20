const express = require('express');
const mjAPI = require('mathjax-node');
const app = express();
const port = 3000;

// Initialize mathjax-node
mjAPI.config({
    MathJax: {
        // Options for MathJax
        // For example, to enable specific extensions:
        // extensions: ["tex2jax.js", "mml2jax.js", "MathMenu.js", "MathZoom.js"],
        // You can find more configuration options in the MathJax documentation
    }
});
mjAPI.start();

// Middleware to parse JSON bodies
app.use(express.json());

// API Endpoint for LaTeX to SVG conversion
app.post('/convert', (req, res) => {
    const latex = req.body.latex;

    if (!latex) {
        return res.status(400).json({ error: 'No LaTeX string provided in the request body.' });
    }

    mjAPI.typeset({
        math: latex,
        format: "TeX", // Specify that the input is TeX/LaTeX
        svg: true,     // Request SVG output
    }, function (data) {
        if (data.errors) {
            console.error('MathJax conversion errors:', data.errors);
            return res.status(500).json({ error: 'Error converting LaTeX to SVG', details: data.errors });
        }

        if (data.svg) {
            res.setHeader('Content-Type', 'image/svg+xml');
            res.send(data.svg);
        } else {
            res.status(500).json({ error: 'Unknown error: SVG data not generated.' });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`LaTeX to SVG API listening at http://localhost:${port}`);
});