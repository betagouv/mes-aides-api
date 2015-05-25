db.situations.update({}, {
	$rename: { 'logement.adresse.ville': 'logement.adresse.nomCommune' }
}, { multi: true });
