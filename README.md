# rx-traverse
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][downloads-url]

Reactive (RxJs 6) traverse library

[Features](#features) | [Installation](#installation) | [Usage](#usage)

## Features

 - **RxJs style:** the library returns an `Observable` object and supports `rxjs/operators`.

 - **Stop/Skip traverse:** is possible to cancel (_stop_) or stop over (_skip_) a specific branch. 

 - **Custom traverse:** is possible to use a custom traverse logic.

 - **ES2017 targeted:** to be safely used with Node engines >=8 LTS

 - **Typescript support**


## Installation

```bash
# Using NPM
$ npm install rx-traverse

# Using Yarn
$ yarn add rx-traverse 
```

## Usage

```typescript
  traverse([1, 2, 3])
    .pipe(
      skip(1),
      map(x => x.state.value),
      toArray())
    .subscribe(console.log);
  
  // Returns:
  // [1, 2, 3]
```

## License

[MIT](https://tldrlegal.com/license/mit-license)

[npm-image]: https://img.shields.io/npm/v/rx-traverse.svg?style=flat-square
[npm-url]: https://npmjs.org/package/rx-traverse
[downloads-image]: http://img.shields.io/npm/dm/rx-traverse.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/rx-traverse