## Release Checklist

#### Update version, tag, and publish
```bash
$ git checkout master
$ npm install
$ npm run test
$ Update CHANGELOG
$ Update version number in `package.json`
$ git add .
$ git commit -m 'vA.B.C'
$ git tag vA.B.C
$ git push origin master vA.B.C
$ npm publish

```
* Open https://github.com/bhousel/node-diff3/tags
* Click "Add Release Notes" and link to the CHANGELOG#version
