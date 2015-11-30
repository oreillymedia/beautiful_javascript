var a = []; a[0] = 'var a = []; '; a[1] = 'a[';
a[2] = '] = ';
a[3] = '\'';
a[4] = '\\';
a[5] = ';';
a[6] = '';
a[7] = 'for(var i = 0; i < a.length; i++) console.log((i == 0 ? a[0] : a[6]) + a[1] + i + a[2] + a[3] + ((i == 3 || i == 4) ? a[4] : a[6]) + a[i] + a[3] + a[5] + (i == 7 ? a[7] : a[6]))';for(var i = 0; i < a.length; i++) console.log((i==0?a[0]:a[6])+a[1]+i+a[2]+a[3]+((i==3||i==4)?a[4]:a[6])+a[i]+a[3]+a[5]+(i==7?a[7]:a[6]))