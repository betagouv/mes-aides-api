A mapping interface between the [mes-aides](https://mes-aides.gouv.fr) [user interface](https://github.com/sgmap/mes-aides-ui) and the [OpenFisca](http://openfisca.fr) simulation engine.

> Une interface de lien entre l'interface utilisateur de mes-aides et OpenFisca.

If you want to run the mes-aides application, you should run [`mes-aides-ui`](https://github.com/sgmap/mes-aides-ui).


Installing
==========

System dependencies
-------------------

### Ubuntu

Make sure `build-essential` and `libkrb5-dev` are installed on your machine:

```sh
sudo apt-get install build-essential
sudo apt-get install libkrb5-dev
```

Note : `libkrb5-dev` is needed to install `kerberos`, an optional dependency of `mongodb-core`. This is yet unclear why npm installs it.

### For all platforms

Mes Aides expects a [Mongo](http://www.mongodb.org) database to be available. If you don't have it yet, [install the Mongo database server](https://www.mongodb.org/downloads) for your platform.

The runtime is [Node 0.12](https://nodejs.org/en/).

You can for example use [`nvm`](https://github.com/creationix/nvm) to install this specific version.

Once you have Node and npm installed, run:

```sh
npm install --global grunt-cli
```


Application
-----------

```sh
git clone https://github.com/sgmap/mes-aides-api.git
cd mes-aides-api
npm install
grunt
```

### Development mode

If you need to add features to the API but want to see the impact on the application, follow the `mes-aides-ui` installation procedure.


Usage
-----

First, start a Mongo server:

```sh
mongod --dbpath db
```

Then, start the server:

```sh
npm start
```
