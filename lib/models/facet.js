
function Facet(raw){
	this.name = raw.name;
	this.elements = raw.facetElements;

	this.elements.sort(function(a,b){
		return b.count - a.count;
	});
}

module.exports = Facet;
