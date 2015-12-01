var fs = require('fs');
var path = require('path');
var assert = require('assert');

var MarkdownIt = require('markdown-it');
var Renderer = require('markdown-it/lib/renderer');

var mdRules = require('../');

function renderToMarkdown(content) {
    // Parse input
    var md = new MarkdownIt({
        html: true,
        langPrefix: 'lang-'
    });
    md.renderer.rules = mdRules;
    return md.render(content);
}

// Testing some markdown with the markdown renderer
// is equivalent to:
//   f(x) == f(f(x))
function testFile(filename) {
    filename = path.resolve(__dirname, './fixtures', filename);
    var content = fs.readFileSync(filename, 'utf-8');

    var md = renderToMarkdown(content);

    assert(md, renderToMarkdown(md));
}


describe('markdown-it-mdrules', function() {
    it('paragraphs', function() {
        testFile('paragraphs.md');
    })


    it('headings', function() {
        testFile('headings.md');
    });

});
