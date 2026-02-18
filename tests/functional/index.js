define([
    'intern!object',
    'intern/chai!assert',
    'require'
], function (registerSuite, assert, require) {
    registerSuite({
        name: 'index',

        'greeting form': function () {
            return this.remote
                .get(require.toUrl('index.html'))
                .waitForElementByCssSelector('body.loaded', 5000)
                .elementById('nameField')
                    .clickElement()
                    .type('Elaine')
                    .end()
                .elementByCssSelector('#loginForm input[type=submit]')
                    .clickElement()
                    .end()
                .elementById('greeting')
                .text()
                .then(function (text) {
                    assert.strictEqual(text, 'Hello, Elaine!', 'Greeting should be displayed when the form is submitted');
                });
        }
    });
});