
# Register Tenant with a DWN Server

This program will register a tenant with a DWN server.  If a DWN Server has the option `DWN_REGISTRATION_PROOF_OF_WORK_ENABLED` turned on, then the API calls will get rejected since the tenant is not registered.  

The 2 parameters needed are the tenant did and the DWN server endpoint.

# Setup

* Confirm you have NodeJS 20+ running

```
node --version
```

* Clone this repo
* Clone the `dwn-server` repo.

```
git clone https://github.com/TBD54566975/dwn-server.git
```

* Copy register-tenant.ts to the folder `dwn-server/tests/scenarios`

```
cp ./dwn-register-tenant/register-tenant.ts dwn-server/tests/scenarios
```

* Install the dependencies

```
cd dwn-server
npm install
npm install -g typescript
```

* Change folders and run this command, passing in the dwn server endpoint and the tenant did.

`npx tsx ./register-tenant.ts {DWN_URL} {DID}`

```
npx tsx ./register-tenant.ts https://dwn.gcda.xyz did:xx:xxxxx
```
```
# Response: 
Retrieved terms of service
Retrieved proof of work challenge
Create registration data
hash:33c44be8c0cc0158773ce665fefa8cdb9d5133a42d44bb87f8581fc9c858953a
iterations: 910657, time lapsed: 2545 ms
Computes POW response nonce
Create registration request
Status: 200
Tenant registered
```
