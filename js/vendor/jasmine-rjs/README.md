# jasmine-rjs

## Introduction

Simple jasmine plugin that make requirejs unit tests simpler.

This plugin is fully compatible with jasmine 1.3 and jasmine 2.0 / 2.2.

## API

Suppose you have a module:

```javascript
require([], function() {
  return {
    hello: function(name) {
      return 'Hello ' + name;
    }
  };
});
```

Using jasmine-rjs plugin, you can unit test your module with a simple syntax:

```javascript
describe('My moodule', function() {

  it('should say hello', rjs(['myModule'], function(myModule) {
    expect(myModule.hello('foo')).toBe('Hello foo');
  }));

});
```

If the name of your module is a valid javascript variable, then you could just define your function and jasmine-rjs will automatically detect parameter name to load your modules:

```javascript
describe('My moodule', function() {

  it('should say hello', rjs(function(myModule) {
    expect(myModule.hello('foo')).toBe('Hello foo');
  }));

});
```

To make it even simpler with a long test suite, you can load your module in your ```beforeEach``̀ function:

```javascript
describe('My moodule', function() {

  var myModule;

  // Use _myModule_ syntax to avoid collision with local variable
  beforeEach(rjs(function(_myModule_) {
    myModule = _myModule_;
  }));

  it('should say hello', function() {
    expect(myModule.hello('foo')).toBe('Hello foo');
  });

});
```

## Licence

MIT License (MIT)

## Contributing

If you find a bug or think about enhancement, feel free to contribute and submit an issue or a pull request.