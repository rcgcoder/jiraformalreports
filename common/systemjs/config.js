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
    'typescript': 'npm:typescript@2.0.2/lib/typescript.js',
    'tidy-html5': 'npm:tidy-html5@0.1.1/tidy.js'
    
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
    }
  }
});