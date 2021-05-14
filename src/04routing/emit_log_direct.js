#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var conf = require('../../conf');

amqp.connect(conf, function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }
        var exchange = 'direct_logs';
        var args = process.argv.slice(2);
        var msg = args.slice(1).join(' ') || 'Hello World!';
        var severity = (args.length > 0) ? args[0] : 'info';

        // direct_logs란 Exchange를 direct로 설정
        channel.assertExchange(exchange, 'direct', {
            durable: false
        });

        // direct_logs란 Exchange에 info라는 Routing key로 메세지 Publish
        channel.publish(exchange, severity, Buffer.from(msg));
        console.log(" [x] Sent %s: '%s'", severity, msg);
    });

    setTimeout(function() {
        connection.close();
        process.exit(0);
    }, 500);
});