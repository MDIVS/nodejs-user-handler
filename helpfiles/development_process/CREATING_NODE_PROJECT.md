[back to devlopment process](./DEVELOPMENT_PROCESS.md)

# Initializing Node

To create a NPM project, just run
```
npm init
```

And then fullfill any project details you want.

If you want to keep everything as default, you can use `-y`
```
npm init -y
```

I personally like to use `entry point` as `app.js`.

After run the given command, a file `package.json` will be created and `entry point` will be described as `main` parameter. The `.js` file described here will be the file runned by the command `node .`.

But before running the project, as `npm init` does not create a main .js file, we first need to create one. For example, creating the following file `app.js`:
```
let result = "Hello" + " " + "World";
console.log(result);
```

And defining `main` at `package.json` as `app.js`, we can run
```
node .
```

Wich will execute our program.

# Scripts
We can also run our program by defining a entire command at the `scripts` parameter in the `package.json` file.

For example, lets create a `dev` entry in `package.json` and give it the command `node app.js`. This way, when we run
```
npm run dev
```

We indirectly are running `node app.js` command wich can be usefull if we need to further simplify passing lots of arguments to it.