var amqp = require('amqplib/callback_api');

module.exports = function(app) {
    var Attendance = app.models.Attendance;
    amqp.connect('amqp://rxzpfahs:ZJYk0DscAJTu8Oxda3Vf_skus_PpV9qw@fish.rmq.cloudamqp.com/rxzpfahs', function(err, conn) {
        conn.createChannel(function(err, ch) {

            var exchangeName = 'ex-date-attendance-dev';

            ch.assertExchange(exchangeName, 'direct', {
                durable: false
            });

            ch.assertQueue('', {
                exclusive: true
            }, function(err, q) {
                console.log(' [*] Waiting for logs. To exit press CTRL+C');

                ch.bindQueue(q.queue, exchangeName, "");

                ch.consume(q.queue, function(msg) {
                    var attendanceData = JSON.parse(msg.content.toString());
                    Attendance.create(attendanceData);
                    console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
                }, {
                    noAck: true
                });
            });
        });
    });
};
