#! /usr/bin/env sh

# Exit on error
set -e

# Step 0: Install Dependencies:
npm install mkcert

# Step 1: Create Certificate Authority:
mkcert create-ca --key certificate_authority.key --cert certificate_authority.crt

# Step 2: Generate Certificate:
mkcert create-cert --key certificate.key --cert certificate.crt

# Step 3: Move Files into Certificates Folder:
mv ./certificate_authority.crt ./certificates/certificate_authority.crt
mv ./certificate_authority.key ./certificates/certificate_authority.key
mv ./certificate.crt ./certificates/certificate.crt
mv ./certificate.key ./certificates/certificate.key
