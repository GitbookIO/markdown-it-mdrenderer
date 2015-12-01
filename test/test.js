var fs = require('fs');
var path = require('path');
var assert = require('assert');

var MarkdownIt = require('markdown-it');
var Renderer = require('markdown-it/lib/renderer');

var mdRules = require('../');

function renderToMarkdown(content) {
    var md = new MarkdownIt({
        html: true,
        langPrefix: 'lang-'
    });
    md.renderer.rules = mdRules;
    return md.render(content);
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
function testFile(filename, debug) {
    filename = path.resolve(__dirname, './fixtures', filename);
    var content = fs.readFileSync(filename, 'utf-8');
    var md = renderToMarkdown(content);

    if (debug) console.log(md);

    // Test md(x) == md(md(x))
    assert.deepEqual(md, renderToMarkdown(md));

    // Test html(x) == html(md(x))
    var originalHtml = renderToHTML(content);
    var resultHtml = renderToHTML(md);

    if (debug) console.log(originalHtml, resultHtml);

    assert.deepEqual(originalHtml, resultHtml);
}


describe('markdown-it-mdrules', function() {
    it('paragraphs', function() {
        testFile('paragraphs.md');
    })


    it('headings', function() {
        testFile('headings.md');
    });

    it('strong', function() {
        testFile('strong.md');
    });

    it('em', function() {
        testFile('em.md');
    });

    it('html', function() {
        testFile('html.md');
    });

    it('image', function() {
        testFile('image.md');
    });

    describe('Code', function() {
        it('inline', function() {
            testFile('code_inline.md');
        });

        it('block', function() {
            testFile('code_block.md');
        });

        it('fences', function() {
            testFile('code_fences.md');
        });
    });
});
