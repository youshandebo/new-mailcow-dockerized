// QQ Mail Blue Theme for Angular Material
(function() {
  'use strict';
  angular.module('SOGo.Common')
    .config(configure)

  configure.$inject = ['$mdThemingProvider'];
  function configure($mdThemingProvider) {
    // Define blue palette (QQ Mail style)
    var qqBlue = $mdThemingProvider.extendPalette('blue', {
      '50': '#e3f2fd',
      '100': '#bbdefb',
      '200': '#90caf9',
      '300': '#64b5f6',
      '400': '#42a5f5',
      '500': '#4A90D9',
      '600': '#357ABD',
      '700': '#2B6CB0',
      '800': '#1e5a8a',
      '900': '#153d6b',
      'A100': '#82b1ff',
      'A200': '#5ba0e0',
      'A400': '#4A90D9',
      'A700': '#357ABD',
      'contrastDefaultColor': 'light',
      'contrastDarkColors': '50 100 200 300 400 A100'
    });
    $mdThemingProvider.definePalette('qq-blue', qqBlue);

    // Light gray background palette
    var lightGrey = $mdThemingProvider.extendPalette('grey', {
      '50': '#f5f7fa',
      '100': '#f0f2f5',
      '200': '#e8ecef',
      '300': '#dde1e6',
      '400': '#ced3d9',
      '500': '#adb5bd',
      'A100': '#f5f7fa'
    });
    $mdThemingProvider.definePalette('qq-grey', lightGrey);

    $mdThemingProvider.theme('default')
      .primaryPalette('qq-blue', {
        'default': '500',
        'hue-1': '300',
        'hue-2': '600',
        'hue-3': '800'
      })
      .accentPalette('qq-blue', {
        'default': 'A200',
        'hue-1': 'A100',
        'hue-2': 'A400',
        'hue-3': 'A700'
      })
      .warnPalette('red')
      .backgroundPalette('qq-grey');

    $mdThemingProvider.generateThemesOnDemand(false);
  }
})();
