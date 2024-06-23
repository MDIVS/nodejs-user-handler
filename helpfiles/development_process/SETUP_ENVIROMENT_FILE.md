[back to devlopment process](./DEVELOPMENT_PROCESS.md)

# Setup enviroment file
If it dont exists, create the `config` folder.
Then, create your `.env` file inside `config` folder.
```
mkdir config
echo "ENV_NAME='dev enviroment'" > config/.env.dev
```

# Setup package.json
If it dont exists, create a custom run script in `package.json` for running your application.

In your run script, add the argument `--env-file=<ENVFILE>`, for example:
```
"scripts": {
    "dev": "node --env-file=config/.env.dev app.js"
    "prod": "node --env-file=config/.env.prod app.js"
},
```

# Using eviroment variables
In the application you can access the enviroment values by using the `process.env` variable. For example:
```
console.log(`Enviroment name: (${process.env.ENV_NAME})`)
```