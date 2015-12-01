var fs = require('fs');
var path = require('path');
var assert = require('assert');

var MarkdownIt = require('markdown-it');
var Renderer = require('markdown-it/lib/renderer');

var Renderer = require('../');
var toMarkdown = new Renderer();

function renderToMarkdown(content) {
    var md = new MarkdownIt({
        html: true,
        langPrefix: 'lang-'
    });
    var tokens = md.parse(content);

    return toMarkdown.render(tokens);
}

function renderToHTML(content) {
    var md = new MarkdownIt({
        html: true,
        langPrefix: 'lang-'
    });
    return md.render(content);
}

// Testing some markdown with the markdown renderer
// is equivalent to:
//   md(x) == md(md(x))
function testFile(filename) {
    filename = path.resolve(__dirname, './fixtures', filename);
    var content = fs.readFileSync(filename, 'utf-8');
    var md = renderToMarkdown(content);
    //console.log(md);
    //console.log(renderToMarkdown(md))

    // Test md(x) == md(md(x))
    assert.deepEqual(md, renderToMarkdown(md));

    // Test html(x) == html(md(x))
    var originalHtml = renderToHTML(content);
    var resultHtml = renderToHTML(md);

    assert.deepEqual(originalHtml, resultHtml);
}


describe('markdown-it-mdrules', function() {
    var files = fs.readdirSync(path.resolve(__dirname, './fixtures'));
   // files = ['list_ol.md'];
    files.forEach(function(filename) {
        it(filename, function() {
            testFile(filename);
        });
    });
});
