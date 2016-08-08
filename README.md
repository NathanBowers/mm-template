# mm-template

Proof of concept for using using Gulp + Node asset pipeline with Middleman site generator.

Why?

Because [Middleman](http://https://middlemanapp.com) is great, but Middleman + Gulp to run Node asset pipeline, Libsass, and BrowserSync is *AWESOME*.

## Getting Started

Main dependencies: Ruby and Node.js

Installing Ruby and Node.js is beyond the scope of this README, but look into `rbenv` or `rvm` for Ruby and `nvm` for Node.js.

### Prerequisities

* Ruby
* Bundler gem
* Node.js + npm

To verify you've got the above prerequisities installed:

```
$ ruby -v
$ gem install bundler
$ node -v
$ npm -v
```

### Installing

Assuming you've got Ruby, Bundler gem, and Node/npm...

1. Clone this repository
1. `$ cd path/to/where/you/cloned/mm-template`
1. `$ bundle install`
1. `$ npm install`
1. `$ middleman` to start local Middleman server. It should open your default browser to localhost:7000.
1. Or, `$ middleman build` to export your Middleman site to static files in `static-build-output`

### Updating

1. `$ bundle update`
1. `$ npm update`

## Support and reporting issues

Something busted? File an issue: [mm-template/issues](issues).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
