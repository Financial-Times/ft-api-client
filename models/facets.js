var Facet = require('./facet.js');


function Facets(raw){
    this.name = raw.name;
    this.elements = [];
    var elements = this.elements;
    raw.facetElements.forEach(function(element){
        elements.push(new Facet(element.name, element.count));
    });

    this.elements.sort(function(a,b){
        return b.count - a.count;
    });
}

module.exports = Facets;
