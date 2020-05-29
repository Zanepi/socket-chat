const { io } = require('../server');

const { Usuarios } = require('../classes/usuarios');

const { crearMensaje } = require('../utils/utils');

const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {


        console.log(data);

        //console.log('data ', data);
        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                message: 'Nombre y sala necesarios'
            });
        }

        client.join(data.sala);

        let personas = usuarios.agregarPersona(client.id, data.nombre, data.sala);

        //console.log(data);
        client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSala(data.sala));
        client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Administrador', `${data.nombre} se unió`));


        callback(usuarios.getPersonasPorSala(data.sala));

    });

    client.on('disconnect', () => {

        let personaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} abandonó el chat`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(personaBorrada.sala));

    })


    client.on('crearMensaje', (data, callback) => {

        let persona = usuarios.getPersona(client.id);

        let message = crearMensaje(persona.nombre, data.message);

        client.broadcast.to(persona.sala).emit('crearMensaje', message);


        callback(message);

    });


    client.on('mensajePrivado', (data) => {

        let persona = usuarios.getPersona(client.id);

        client.broadcast.to(data.to).emit('mensajePrivado', crearMensaje(persona.nombre, data.message))


    });

});