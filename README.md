# markdown-it-mdrenderer

[![Build Status](https://travis-ci.org/GitbookIO/markdown-it-mdrenderer.png?branch=master)](https://travis-ci.org/GitbookIO/markdown-it-mdrenderer)
[![NPM version](https://badge.fury.io/js/markdown-it-mdrenderer.svg)](http://badge.fury.io/js/markdown-it-mdrenderer)

Renderer for [markdown-it](https://github.com/markdown-it/markdown-it to render back as Markdown.

### Installation

```
$ npm install markdown-it-mdrenderer
```

### Usage

```js
var MarkdownIt = require('markdown-it');
var MdRenderer = require('markdown-it-mdrenderer');

var md = new MarkdownIt({
    html: true,
    langPrefix: 'lang-'
});

// Parse as tokens
var tokens = md.parse('Hello **world**');

// Render back as markdown
var renderer = new MdRenderer();
var markdown = renderer.render(tokens);
```
