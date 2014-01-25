/* global moment, countdown */

var $c = $('.countdown'),
    m = moment('2014-03-16T23:00:00.000Z');
    setTime = function () {
        var time = m.countdown(
            new Date(),
            countdown.DAYS|countdown.HOURS|countdown.MINUTES|countdown.SECONDS,
            NaN,
            0
        ).toString();
        $c.html(time.replace(/, (and )?/g, '<br>'));
        $('title').text('Tweet Your Bracket | ' + time);
    };

setTime();
setInterval(setTime, 1000);
