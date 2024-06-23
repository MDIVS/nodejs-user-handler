if (!process.env.ENV_NAME) throw new Error('No enviroment detected, check if you are running the application using "npm run" command.')
console.log(`Node Js User Handler (${process.env.ENV_NAME})`)