var amqp = require('amqplib/callback_api');

module.exports = function(app) {
    var Guild = app.models.Guild;
    amqp.connect(process.env.AMQP_URI, function(err, conn) {
        if (err)
            throw "amqp:failed to connect";
        conn.createChannel(function(err, ch) {
            if (err)
                throw "amqp:failed to create channel";

            var exchangeName = process.env.AMQP_EXCHANGE;

            ch.assertExchange(exchangeName, 'direct', {
                durable: false
            });

            ch.assertQueue('', {
                exclusive: true
            }, function(err, q) {
                if (err)
                    throw "amqp:failed to assert queue";

                ch.bindQueue(q.queue, exchangeName, "guild");
                ch.consume(q.queue, function(msg) {
                    var guildData = JSON.parse(msg.content.toString());
                    Guild.create(guildData);
                }, {
                    noAck: true
                });
            });
        });
    });
};
