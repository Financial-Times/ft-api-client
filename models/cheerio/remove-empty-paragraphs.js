
/**
 * Removes paragraphs elements containing only whitespace nodes
 * @return String
 */
module.exports = function(html) {
    return html.replace(/<p>\s+<\/p>/, '');
};
