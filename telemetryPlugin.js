function getTelemetry() {
    return http.get('/telemetry.json')
        .then(function (result) {
            return result.data;
        });
}

var objectProvider = {
    get: function (identifier) {
        return getTelemetry().then(function (dictionary) {
            if (identifier.key === 'telemetry') {
                return {
                    identifier: identifier,
                    name: dictionary.name,
                    type: 'folder',
                    location: 'ROOT'
                };
            } else {
                var measurement = dictionary.measurements.filter(function (m) {
                    return m.key === identifier.key;
                })[0];
                return {
                    identifier: identifier,
                    name: measurement.name,
                    type: 'example.telemetry',
                    telemetry: {
                        values: measurement.values
                    },
                    location: 'example.taxonomy:telemetry'
                };
            }
        });
    }
};

var compositionProvider = {
    appliesTo: function (domainObject) {
        return domainObject.identifier.namespace === 'example.taxonomy' &&
               domainObject.type === 'folder';
    },
    load: function (domainObject) {
        return getTelemetry()
            .then(function (dictionary) {
                return dictionary.measurements.map(function (m) {
                    return {
                        namespace: 'example.taxonomy',
                        key: m.key
                    };
                });
            });
    }
};


function telemetryPlugin() {
    return function install() {
        console.log("I've been installed!");
        openmct.objects.addRoot({
            namespace: 'example.taxonomy',
            key: 'telemetry'
        });
        openmct.objects.addProvider('example.taxonomy', objectProvider);
        openmct.composition.addProvider(compositionProvider);
        openmct.types.addType('example.telemetry', {
            name: 'Example Telemetry Point',
            description: 'Example telemetry point from our happy tutorial.',
            cssClass: 'icon-telemetry'
        });   
    };
};