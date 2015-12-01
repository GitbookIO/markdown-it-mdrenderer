
var BL = '\n';

function whitespaces(n, char) {
    return (new Array(n + 1)).join(char || ' ');
}

function constant(s) {
    return function() {
        return s;
    };
}

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

function empty(tokens, idx) {
    return '';
}

function block(fn) {
    fn = fn || contentWithMarkup;

    return function(tokens, idx) {
        var result = '';
        var token = tokens[idx];
        var needLf = false;

        if (token.hidden) return '';

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

var emptyBlock = block(empty);

function listOpen(tokens, idx, options, env, slf) {
    var tok = tokens[idx];
    slf._olIndex = 1;

    if (tok.level > 0) return BL;
    else return emptyBlock.apply(this, arguments);
}

function listClose(tokens, idx) {
    var tok = tokens[idx];

    if (tok.level > 0) return '';
    else return emptyBlock.apply(this, arguments);
}

var defaultRules = {
    inline: contentWithoutMarkup,

    code_inline: contentWithBothMarkup,
    code_block: fence,
    fence: fence,

    hr: block(contentWithMarkup),

    paragraph_open: block(),
    paragraph_close: block(),

    ////////  Headings
    ////////
    heading_open: block(function(tokens, idx) {
        var token = tokens[idx];
        return token.markup+' '+token.content;
    }),
    heading_close: block(contentWithoutMarkup),

    //////// Inline formating
    strong_open: contentWithMarkup,
    strong_close: contentWithMarkup,

    em_open: contentWithMarkup,
    em_close: contentWithMarkup,

    ////////  Lists
    ////////
    bullet_list_open: listOpen,
    bullet_list_close: listClose,
    ordered_list_open: listOpen,
    ordered_list_close: listClose,
    list_item_open: function(tokens, idx, options, env, slf) {
        var tok = tokens[idx];
        var markup = tok.markup;
        if (markup == '.') {
            markup = slf._olIndex+'.';
            slf._olIndex = slf._olIndex + 1;
        }
        return whitespaces(tok.level - 1, '  ') + markup + ' ' + tok.content;
    },
    list_item_close:function(tokens, idx) {
        var tok = tokens[idx];

        if (tok.level > 3) return '';
        else return BL;
    },

    ////////  Block images
    ////////
    image: block(function (tokens, idx, options, env, slf) {
        var token = tokens[idx];

        var alt = token.attrs[token.attrIndex('alt')][1] =
        slf.renderInlineAsText(token.children, options, env);

        var src = token.attrs[token.attrIndex('src')][1];

        return '!['+alt+']('+src+')';
    }),

    text: contentWithMarkup,

    html_block: contentWithoutMarkup,
    html_inline: contentWithoutMarkup,

    softbreak: function() {
        return BL;
    },
    hardbreak: function() {
        return BL;
    }
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

    if (typeof rules[type] !== 'undefined') {
        var s = rules[tokens[i].type](tokens, i, options, env, this);
        //console.log(whitespaces(tokens[i].level,'--'), type,  JSON.stringify(s));
        result += s;
    }
  }

  return result;
};

module.exports = Renderer;

