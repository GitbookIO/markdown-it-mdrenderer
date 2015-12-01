# markdown-it-mdrules

[![Build Status](https://travis-ci.org/GitbookIO/markdown-it-mdrules.png?branch=master)](https://travis-ci.org/GitbookIO/markdown-it-mdrules)
[![NPM version](https://badge.fury.io/js/markdown-it-mdrules.svg)](http://badge.fury.io/js/markdown-it-mdrules)


Rules for [markdown-it](https://github.com/markdown-it/markdown-it) renderer to render tokens as Markdown. Useful to transform markdown.

### Installation

```
$ npm install markdown-it-mdrules
```

### Usage

```js
var MarkdownIt = require('markdown-it');
var mdRules = require('markdown-it-mdrules');

var md = new MarkdownIt({
    html: true,
    langPrefix: 'lang-'
});
md.renderer.rules = mdRules;

// Render markdown as markdown
md.render('Hello **world**');
```
