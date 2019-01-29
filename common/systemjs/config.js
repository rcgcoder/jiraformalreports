System.config({
  //use typescript for compilation
  transpiler: 'typescript',
  //typescript compiler options
  typescriptOptions: {
    emitDecoratorMetadata: true
  },
  paths: {
    'npm:': 'https://cdn.jsdelivr.net/npm/'
//	    'npm:': 'https://unpkg.com/'
  },
  //map tells the System loader where to look for things
  map: {
    
    'app': systemjsComposeUrl('systemjs/ts'),
    
    '@angular/core': 'npm:@angular/core@5.2.10/bundles/core.umd.js',
    '@angular/common': 'npm:@angular/common@5.2.10/bundles/common.umd.js',
    '@angular/compiler': 'npm:@angular/compiler@5.2.10/bundles/compiler.umd.js',
    '@angular/platform-browser': 'npm:@angular/platform-browser@5.2.10/bundles/platform-browser.umd.js',
    '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic@5.2.10/bundles/platform-browser-dynamic.umd.js',
    '@angular/http': 'npm:@angular/http@5.2.10/bundles/http.umd.js',
    '@angular/router': 'npm:@angular/router@5.2.10/bundles/router.umd.js',
    '@angular/forms': 'npm:@angular/forms@5.2.10/bundles/forms.umd.js',
    
    '@angular/core/testing': 'npm:@angular/core@5.2.10/bundles/core-testing.umd.js',
    '@angular/common/testing': 'npm:@angular/common@5.2.10/bundles/common-testing.umd.js',
    '@angular/compiler/testing': 'npm:@angular/compiler@5.2.10/bundles/compiler-testing.umd.js',
    '@angular/platform-browser/testing': 'npm:@angular/platform-browser@5.2.10/bundles/platform-browser-testing.umd.js',
    '@angular/platform-browser-dynamic/testing': 'npm:@angular/platform-browser-dynamic@5.2.10/bundles/platform-browser-dynamic-testing.umd.js',
    '@angular/http/testing': 'npm:@angular/http@5.2.10/bundles/http-testing.umd.js',
    '@angular/router/testing': 'npm:@angular/router@5.2.10/bundles/router-testing.umd.js',
    'rxjs': 'npm:rxjs@5.5',
    'odt': 'npm:odt@1.1.0',
   // 'isBuffer':'npm:isbuffer@0.0.0',
//    'util': 'npm:util@0.11.1' ,
    'punycode':'npm:punycode@1.4.1',
   // 'url':'js/libs/node-libs/url',
    'url':'js/libs/node-libs/url',
    'http':'js/libs/node-libs/internal',
//    'crypto':'npm:crypto@1.0.1',
//    'oauth-js':'npm:oauth-js@0.9.9',
    'oauth':'npm:oauth-js@0.9.9',
//    'npm:oauth-js@0.9.9/lib/sha1':'npm:oauth-js@0.9.9/lib/sha1.js',
    
    'querystring':'npm:querystring@0.2.0',
    'typescript': 'npm:typescript@2.0.2/lib/typescript.js',
    '_http_agent':'js/libs/node-libs/internal'
    ,'net':'js/libs/node-libs/internal'
    ,'events':'js/libs/node-libs/internal'
    ,'stream':'js/libs/node-libs/internal'
    ,'util':'js/libs/node-libs/internal'
    ,'assert':'js/libs/node-libs/internal'
    ,'buffer':'js/libs/node-libs/internal'
    ,'dns':'js/libs/node-libs/internal'
    ,'cluster':'js/libs/node-libs/internal'
    ,'https':'js/libs/node-libs/internal'
    
//    'typescript': 'npm:typescript@2.8.3/lib/typescript.js'
  },
  //packages defines our app package
  packages: {
    app: {
      main: './main.ts',
      defaultExtension: 'ts'
    },
    rxjs: {
      defaultExtension: 'js'
    },
    oauth: {
    	main: './index.js',
    	defaultExtension: 'js'
    },
    punycode: {
    	main: './punycode.js',
    	defaultExtension: 'js' 
    },
    url: {
    	main: './url.js',
    	defaultExtension: 'js'
    },
    querystring: {
    	main: './index.js',
    	defaultExtension: 'js'
    },
    http: {main: './http.js',defaultExtension: 'js'}
    ,https: {main: './https.js',defaultExtension: 'js'}
    ,_http_agent: {main: './_http_agent.js',defaultExtension: 'js'}
    ,net: {main: './net.js',defaultExtension: 'js'}
    ,events: {main: './events.js',defaultExtension: 'js'}
    ,stream: {main: './stream.js',defaultExtension: 'js'}
    ,util: {main: './util.js',defaultExtension: 'js'}
    ,assert: {main: './assert.js',defaultExtension: 'js'}
    ,buffer: {main: './buffer.js',defaultExtension: 'js'}
    ,dns: {main: './dns.js',defaultExtension: 'js'}
    ,cluster: {main: './cluster.js',defaultExtension: 'js'}
    
  }
});