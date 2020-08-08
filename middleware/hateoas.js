module.exports = function (req, res, sauces, baseUrl){

	function generate(req, res, sauce, baseUrl){
		const ref = 'http://' + req.get('host') + '/' + baseUrl;
		let newSauce = sauce.toJSON();
		newSauce._links = {};
		newSauce._links.self = {
			method: 'GET',
			href: ref
		};
		newSauce._links.create = {
			method: 'POST',
			href: ref
		};
		newSauce._links.update = {
			method: 'PUT',
			href: ref + '/' + newSauce._id
		};
		newSauce._links.delete = {
			method: 'DELETE',
			href: ref + '/' + newSauce._id
		};
		newSauce._links.like = {
			method: 'POST',
			href: ref + '/' + newSauce._id + '/like'
		};
		newSauce._links.list = {
			method: 'GET',
			href: ref
		};
		return newSauce;
	}
	if(Array.isArray(sauces)){
		let returnSauce = [];
		sauces.forEach(function (sauce) {
			returnSauce.push(generate(req, res, sauce, baseUrl));
		});
		res.status(200).json(returnSauce);
	}
	else{
		if(sauces == null){
			res.status(404).json('No result found for id '+req.params._id);
		}
		let returnSauce = generate(req, res, sauces, baseUrl);
		res.status(200).json(returnSauce);
	}
}