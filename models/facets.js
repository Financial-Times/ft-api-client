
function Facets(raw){
    this.name = raw.name;
    this.elements = raw.facetElements;

    this.elements.sort(function(a,b){
        return b.count - a.count;
    });

    this.totalCount = this.elements.reduce(function(val, element){
        return val + element.count;
    }, 0);
}

module.exports = Facets;
