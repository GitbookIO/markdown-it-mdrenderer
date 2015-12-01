
var BL = '\n';

function contentWithMarkup(tokens, idx) {
    var tok = tokens[idx];
    return tok.markup+tok.content;
}

function contentWithBothMarkup(tokens, idx) {
    var tok = tokens[idx];
    return tok.markup+tok.content+tok.markup;
}

function contentWithoutMarkup(tokens, idx) {
    var tok = tokens[idx];
    return tok.content;
}

function block(fn) {
    fn = fn || contentWithMarkup;

    return function(tokens, idx) {
        var result = '';
        var token = tokens[idx];
        var needLf = false;

        if (token.block && token.nesting !== -1 && idx) {
            result += '\n';
        }

        result += fn.apply(this, arguments);

        // Check if we need to add a newline after this tag
        if (token.block) {
            needLf = true;

            if (token.nesting === 1) {
                if (idx + 1 < tokens.length) {
                    nextToken = tokens[idx + 1];

                    if (nextToken.type === 'inline' || nextToken.hidden) {
                        // Block-level tag containing an inline tag.
                        //
                        needLf = false;

                    } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
                        // Opening tag + closing tag of the same type. E.g. `<li></li>`.
                        //
                        needLf = false;
                    }
                }
            }
        }

        result += needLf ? '\n' : '';
        return result;
    }
}

var fence = block(function(tokens, idx) {
    var tok = tokens[idx];
    return '```' + tok.info + BL + tok.content + '```';
});


module.exports = {
    code_inline: contentWithBothMarkup,
    code_block: fence,
    fence: fence,

    paragraph_open: block(),
    paragraph_close: block(),

    heading_open: block(function(tokens, idx) {
        var token = tokens[idx];
        return token.markup+' '+token.content;
    }),
    heading_close: block(contentWithoutMarkup),

    strong_open: contentWithMarkup,
    strong_close: contentWithMarkup,

    em_open: contentWithMarkup,
    em_close: contentWithMarkup,

    softbreak: function() {
        return '\n';
    },
    hardbreak: function() {
        return '\n';
    },

    image: block(function (tokens, idx, options, env, slf) {
        var token = tokens[idx];

        var alt = token.attrs[token.attrIndex('alt')][1] =
        slf.renderInlineAsText(token.children, options, env);

        var src = token.attrs[token.attrIndex('src')][1];

        return '!['+alt+']('+src+')';
    }),

    text: contentWithMarkup,

    html_block: contentWithoutMarkup,
    html_inline: contentWithoutMarkup
};
