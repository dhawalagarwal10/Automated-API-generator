#!/bin/bash

echo "================================"
echo "automated api generator - setup"
echo "================================"
echo ""

# check if node is installed
if ! command -v node &> /dev/null; then
    echo "error: node.js is not installed"
    echo "please install node.js 16+ from https://nodejs.org/"
    exit 1
fi

echo "✓ node.js $(node --version) detected"

# check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "error: npm is not installed"
    exit 1
fi

echo "✓ npm $(npm --version) detected"
echo ""

# install dependencies
echo "installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "error: failed to install dependencies"
    exit 1
fi

echo ""
echo "✓ dependencies installed successfully"
echo ""

# check for .env file
if [ ! -f .env ]; then
    echo "creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  important: add your openai api key to the .env file"
    echo ""
else
    echo "✓ .env file already exists"
    echo ""
fi

# create necessary directories
mkdir -p generated

echo "================================"
echo "setup complete!"
echo "================================"
echo ""
echo "next steps:"
echo "1. add your openai api key to .env file"
echo "2. run 'npm start' to start the server"
echo "3. open http://localhost:3000 in your browser"
echo ""
