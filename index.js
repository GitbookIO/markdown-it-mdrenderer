
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
            result += BL;
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

        result += needLf ? BL : '';
        return result;
    }
}

var fence = block(function(tokens, idx) {
    var tok = tokens[idx];
    return '```' + tok.info + BL + tok.content + '```';
});


var defaultRules = {
    code_inline: contentWithBothMarkup,
    code_block: fence,
    fence: fence,

    hr: block(contentWithMarkup),

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

    link_open: function contentWithMarkup(tokens, idx) {
        var token = tokens[idx];
        var href = token.attrs[token.attrIndex('href')][1];

        return '[]('+href+')';
    },
    link_close: contentWithoutMarkup,

    softbreak: function() {
        return BL;
    },
    hardbreak: function() {
        return BL;
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

function Renderer() {
    this.rules = defaultRules;
}

Renderer.prototype.renderInlineAsText = function (tokens, options, env) {
  var result = '',
      rules = this.rules;

  for (var i = 0, len = tokens.length; i < len; i++) {
    if (tokens[i].type === 'text') {
      result += rules.text(tokens, i, options, env, this);
    } else if (tokens[i].type === 'image') {
      result += this.renderInlineAsText(tokens[i].children, options, env);
    }
  }

  return result;
};

Renderer.prototype.render = function (tokens, options, env) {
  var i, len, type,
      result = '',
      rules = this.rules;

  for (i = 0, len = tokens.length; i < len; i++) {
    type = tokens[i].type;

    if (type === 'inline') {
      result += tokens[i].content;
    } else if (typeof rules[type] !== 'undefined') {
      result += rules[tokens[i].type](tokens, i, options, env, this);
    }
  }

  return result;
};

module.exports = Renderer;

