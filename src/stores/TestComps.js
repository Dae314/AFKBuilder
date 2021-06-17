import { readable } from 'svelte/store';

const MasterComps = readable([
	{ name: 'Ainzbedo',
		uuid: '95a86b74-45da-4184-bad5-da065dda0273',
		desc: 'The Ainz + Albedo (Ainzbedo) comp is currently one of the best single fight pushing comps in the game. Your goal with this comp is to stall for at least 15 seconds (30 without furniture) until Ainz can ult and his "Goal of all Life is Death" skill can activate. This comp can work without Albedo, but at high deficits, Albedo is important for buffing Ainz and allowing his ultimate ability to clean up enemies after "The Goal of All Life is Death" has triggered.The Ainz + Albedo (Ainzbedo) comp is currently one of the best single fight pushing comps in the game. Your goal with this comp is to stall for at least 15 seconds (30 without furniture) until Ainz can ult and his "Goal of all Life is Death" skill can activate. This comp can work without Albedo, but at high deficits, Albedo is important for buffing Ainz and allowing his ultimate ability to clean up enemies after "The Goal of All Life is Death" has triggered.The Ainz + Albedo (Ainzbedo) comp is currently one of the best single fight pushing comps in the game. Your goal with this comp is to stall for at least 15 seconds (30 without furniture) until Ainz can ult and his "Goal of all Life is Death" skill can activate. This comp can work without Albedo, but at high deficits, Albedo is important for buffing Ainz and allowing his ultimate ability to clean up enemies after "The Goal of All Life is Death" has triggered.The Ainz + Albedo (Ainzbedo) comp is currently one of the best single fight pushing comps in the game. Your goal with this comp is to stall for at least 15 seconds (30 without furniture) until Ainz can ult and his "Goal of all Life is Death" skill can activate. This comp can work without Albedo, but at high deficits, Albedo is important for buffing Ainz and allowing his ultimate ability to clean up enemies after "The Goal of All Life is Death" has triggered.The Ainz + Albedo (Ainzbedo) comp is currently one of the best single fight pushing comps in the game. Your goal with this comp is to stall for at least 15 seconds (30 without furniture) until Ainz can ult and his "Goal of all Life is Death" skill can activate. This comp can work without Albedo, but at high deficits, Albedo is important for buffing Ainz and allowing his ultimate ability to clean up enemies after "The Goal of All Life is Death" has triggered.The Ainz + Albedo (Ainzbedo) comp is currently one of the best single fight pushing comps in the game. Your goal with this comp is to stall for at least 15 seconds (30 without furniture) until Ainz can ult and his "Goal of all Life is Death" skill can activate. This comp can work without Albedo, but at high deficits, Albedo is important for buffing Ainz and allowing his ultimate ability to clean up enemies after "The Goal of All Life is Death" has triggered.The Ainz + Albedo (Ainzbedo) comp is currently one of the best single fight pushing comps in the game. Your goal with this comp is to stall for at least 15 seconds (30 without furniture) until Ainz can ult and his "Goal of all Life is Death" skill can activate.',
		starred: false,
		draft: true,
		author: 'MrPoop Buttho',
		lastUpdate: new Date('June 3, 2021'),
		heroes: {
			arthur: {ascendLv: 4, si: 30, furn: 3, artifact: ['waistband'], core: false},
			albedo: {ascendLv: 5, si: 30, furn: 3, artifact: ['barricade'], core: true},
			ainz: {ascendLv: 4, si: 30, furn: 9, artifact: ['windbinder','warden'], core: true},
			rowan: {ascendLv: 3, si: 30, furn: 0, artifact: ['call'], core: false},
			talene: {ascendLv: 1, si: 30, furn: 9, artifact: ['blade'], core: false},
			ezio: {ascendLv: 6, si: 20, furn: 3, artifact: ['eye'], core: false},
			hendrik: {ascendLv: 6, si: 20, furn: 0, artifact: ['barricade'], core: false},
			brutus: {ascendLv: 0, si: 0, furn: 0, artifact: ['barricade'], core: false},
			numisu: {ascendLv: 6, si: 20, furn: 3, artifact: ['call'], core: false},
			safiya: {ascendLv: 6, si: 20, furn: 0, artifact: ['windbinder'], core: false},
			alna: {ascendLv: 6, si: 30, furn: 9, artifact: ['call'], core: false},
			zaphrael: {ascendLv: 6, si: 30, furn: 3, artifact: ['call'], core: false},
			ferael: {ascendLv: 6, si: 30, furn: 9, artifact: ['call'], core: false},
			ezizh: {ascendLv: 0, si: 0, furn: 0, artifact: ['call'], core: false},
		},
		lines: [
			{ name: 'Optimal', heroes: [ 'arthur', 'albedo', 'ainz', 'rowan', 'talene' ], },
			{ name: 'Multi', heroes: ['hendrik', 'albedo', 'ainz', 'ezio', 'talene' ], },
			{ name: 'Budget', heroes: ['brutus', 'albedo', 'ainz', 'safiya', 'numisu' ], },
		],
		subs: [
			{ name: 'Tanks',
				heroes: ['hendrik','brutus','alna'],
			},
			{ name: 'Supports',
				heroes: ['numisu','ezizh'],
			},
			{ name: 'Damage',
				heroes: ['ezio','safiya','zaphrael'],
			},
			{ name: 'CC',
				heroes: ['ferael']
			},
		],
	},
	{ name: 'MD Test 1',
		uuid: '18d9b3c7-cc27-48aa-ae18-983e5efb4217',
desc: `---
__Advertisement :)__

- __[pica](https://nodeca.github.io/pica/demo/)__ - high quality and fast image
  resize in browser.
- __[babelfish](https://github.com/nodeca/babelfish/)__ - developer friendly
  i18n with plurals support and easy syntax.

You will like those projects!

---

# h1 Heading 8-)
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading


## Horizontal Rules

___

---

***


## Typographic replacements

Enable typographer option to see result.

(c) (C) (r) (R) (tm) (TM) (p) (P) +-

test.. test... test..... test?..... test!....

!!!!!! ???? ,,  -- ---

"Smartypants, double quotes" and 'single quotes'


## Emphasis

**This is bold text**

__This is bold text__

*This is italic text*

_This is italic text_

~~Strikethrough~~


## Blockquotes


> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.


## Lists

Unordered

+ Create a list by starting a line with \`+\`, \`-\`, or \`*\`
+ Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
+ Very easy!

Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa


1. You can use sequential numbers...
1. ...or keep all the numbers as \`1.\`

Start numbering with offset:

57. foo
1. bar


## Code

Inline \`code\`

Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code


Block code "fences"

\`\`\`
Sample text here...
\`\`\`

Syntax highlighting

\`\`\` js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
\`\`\`

## Tables

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Right aligned columns

| Option | Description |
| ------:| -----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |


## Links

[link text](http://dev.nodeca.com)

[link with title](http://nodeca.github.io/pica/demo/ "title text!")

Autoconverted link https://github.com/nodeca/pica (enable linkify to see)


## Images

![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")

Like links, Images also have a footnote style syntax

![Alt text][id]

With a reference later in the document defining the URL location:

[id]: https://octodex.github.com/images/dojocat.jpg  "The Dojocat"
`,
		starred: false,
		draft: false,
		author: 'Arty',
		lastUpdate: new Date('May 31, 2021'),
		heroes: {
			eironn: {ascendLv: 6, si: 20, furn: 9, artifact: ['shroud'], core: true},
			skriath: {ascendLv: 6, si: 0, furn: 3, artifact: ['call'], core: true},
			lucretia: {ascendLv: 6, si: 30, furn: 9, artifact: ['windbinder'], core: false},
			rowan: {ascendLv: 6, si: 30, furn: 0, artifact: ['call'], core: false},
			lyca: {ascendLv: 6, si: 20, furn: 9, artifact: ['shroud'], core: false},
			tidus: {ascendLv: 6, si: 20, furn: 0, artifact: ['eye'], core: false},
			gorvo: {ascendLv: 6, si: 0, furn: 0, artifact: ['waistband'], core: false},
			brutus: {ascendLv: 0, si: 0, furn: 0, artifact: ['barricade'], core: false},
			joker: {ascendLv: 6, si: 0, furn: 0, artifact: ['shroud'], core: false},
			flora: {ascendLv: 0, si: 0, furn: 0, artifact: ['windbinder'], core: false},
			safiya: {ascendLv: 6, si: 20, furn: 0, artifact: ['windbinder'], core: false},
			thoran: {ascendLv: 6, si: 0, furn: 0, artifact: ['call'], core: false},
		},
		lines: [
			{ name: 'Optimal', heroes: [ 'lyca', 'skriath', 'lucretia', 'eironn', 'tidus' ], },
			{ name: 'Multi', heroes: ['gorvo', 'tidus', 'skriath', 'eironn', 'lucretia' ], },
			{ name: 'Budget', heroes: ['brutus', 'rowan', 'skriath', 'eironn', 'lyca' ], },
		],
		subs: [
			{ name: 'Damage',
				heroes: ['joker','flora','thoran'],
			},
			{ name: 'Utility',
				heroes: ['safiya'],
			},
		],
	},
	{ name: 'XSS Test 1',
		uuid: '1e91689b-c247-4550-b619-800871252c9b',
desc: `.
[normal link](javascript)
.
<p><a href="javascript">normal link</a></p>
.


Should not allow some protocols in links and images
.
[xss link](javascript:alert(1))

[xss link](JAVASCRIPT:alert(1))

[xss link](vbscript:alert(1))

[xss link](VBSCRIPT:alert(1))

[xss link](file:///123)
.
<p>[xss link](javascript:alert(1))</p>
<p>[xss link](JAVASCRIPT:alert(1))</p>
<p>[xss link](vbscript:alert(1))</p>
<p>[xss link](VBSCRIPT:alert(1))</p>
<p>[xss link](file:///123)</p>
.


.
[xss link](&#34;&#62;&#60;script&#62;alert&#40;&#34;xss&#34;&#41;&#60;/script&#62;)

[xss link](&#74;avascript:alert(1))

[xss link](&#x26;#74;avascript:alert(1))

[xss link](\&#74;avascript:alert(1))
.
<p><a href="%22%3E%3Cscript%3Ealert(%22xss%22)%3C/script%3E">xss link</a></p>
<p>[xss link](Javascript:alert(1))</p>
<p><a href="&amp;#74;avascript:alert(1)">xss link</a></p>
<p><a href="&amp;#74;avascript:alert(1)">xss link</a></p>
.

.
[xss link](<javascript:alert(1)>)
.
<p>[xss link](&lt;javascript:alert(1)&gt;)</p>
.

.
[xss link](javascript&#x3A;alert(1))
.
<p>[xss link](javascript:alert(1))</p>
.


Should not allow data-uri except some whitelisted mimes
.
![](data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)
.
<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt=""></p>
.

.
[xss link](data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4K)
.
<p>[xss link](data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4K)</p>
.

.
[normal link](/javascript:link)
.
<p><a href="/javascript:link">normal link</a></p>
.


Image parser use the same code base as link.
.
![xss link](javascript:alert(1))
.
<p>![xss link](javascript:alert(1))</p>
.


Autolinks
.
<javascript&#x3A;alert(1)>

<javascript:alert(1)>
.
<p>&lt;javascript:alert(1)&gt;</p>
<p>&lt;javascript:alert(1)&gt;</p>
.


Linkifier
.
javascript&#x3A;alert(1)

javascript:alert(1)
.
<p>javascript:alert(1)</p>
<p>javascript:alert(1)</p>
.


References
.
[test]: javascript:alert(1)
.
<p>[test]: javascript:alert(1)</p>
.


Make sure we decode entities before split:
.
\`\`\`js&#32;custom-class
test1
\`\`\`

\`\`\`js&#x0C;custom-class
test2
\`\`\`
.
<pre><code class="js">test1
</code></pre>
<pre><code class="js">test2
</code></pre>
.`,
		starred: false,
		draft: false,
		author: 'Arty',
		lastUpdate: new Date('May 31, 2021'),
		heroes: {
			arthur: {ascendLv: 6, si: 30, furn: 3, artifact: ['waistband'], core: false},
			albedo: {ascendLv: 6, si: 30, furn: 3, artifact: ['barricade'], core: true},
			ainz: {ascendLv: 6, si: 30, furn: 9, artifact: ['windbinder'], core: true},
			rowan: {ascendLv: 6, si: 30, furn: 0, artifact: ['call'], core: false},
			talene: {ascendLv: 6, si: 30, furn: 9, artifact: ['blade'], core: false},
			ezio: {ascendLv: 6, si: 20, furn: 3, artifact: ['eye'], core: false},
			hendrik: {ascendLv: 6, si: 20, furn: 0, artifact: ['barricade'], core: false},
			brutus: {ascendLv: 0, si: 0, furn: 0, artifact: ['barricade'], core: false},
			numisu: {ascendLv: 6, si: 20, furn: 3, artifact: ['call'], core: false},
			safiya: {ascendLv: 6, si: 20, furn: 0, artifact: ['windbinder'], core: false},
			alna: {ascendLv: 6, si: 30, furn: 9, artifact: ['call'], core: false},
			zaphrael: {ascendLv: 6, si: 30, furn: 3, artifact: ['call'], core: false},
			ferael: {ascendLv: 6, si: 30, furn: 9, artifact: ['call'], core: false},
			ezizh: {ascendLv: 0, si: 0, furn: 0, artifact: ['call'], core: false},
		},
		lines: [
			{ name: 'Optimal', heroes: [ 'arthur', 'albedo', 'ainz', 'rowan', 'talene' ], },
			{ name: 'Multi', heroes: ['hendrik', 'albedo', 'ainz', 'ezio', 'talene' ], },
			{ name: 'Budget', heroes: ['brutus', 'albedo', 'ainz', 'safiya', 'numisu' ], },
		],
		subs: [
			{ name: 'Tanks',
				heroes: ['hendrik','brutus','alna'],
			},
			{ name: 'Supports',
				heroes: ['numisu','ezizh'],
			},
			{ name: 'Damage',
				heroes: ['ezio','safiya','zaphrael'],
			},
			{ name: 'CC',
				heroes: ['ferael']
			},
		],
	},
	{ name: 'Five Pull',
		uuid: '325a47eb-53fd-499a-8d67-da10cf6031e9',
		desc: 'This comp relies on Skriath\'s 3/9 furniture ability and Eironn\'s start of match pull to yank all 5 enemies onto your side of the battlefield. At lower chapters and with a well invested Eironn, Eironn can carry this composition by himself. In later chapters or at higher deficits, Lucretia is often the carry.',
		starred: false,
		draft: false,
		author: 'Arty',
		lastUpdate: new Date('May 31, 2021'),
		heroes: {
			eironn: {ascendLv: 6, si: 20, furn: 9, artifact: ['shroud'], core: true},
			skriath: {ascendLv: 6, si: 0, furn: 3, artifact: ['call'], core: true},
			lucretia: {ascendLv: 6, si: 30, furn: 9, artifact: ['windbinder'], core: false},
			rowan: {ascendLv: 6, si: 30, furn: 0, artifact: ['call'], core: false},
			lyca: {ascendLv: 6, si: 20, furn: 9, artifact: ['shroud'], core: false},
			tidus: {ascendLv: 6, si: 20, furn: 0, artifact: ['eye'], core: false},
			gorvo: {ascendLv: 6, si: 0, furn: 0, artifact: ['waistband'], core: false},
			brutus: {ascendLv: 0, si: 0, furn: 0, artifact: ['barricade'], core: false},
			joker: {ascendLv: 6, si: 0, furn: 0, artifact: ['shroud'], core: false},
			flora: {ascendLv: 0, si: 0, furn: 0, artifact: ['windbinder'], core: false},
			safiya: {ascendLv: 6, si: 20, furn: 0, artifact: ['windbinder'], core: false},
			thoran: {ascendLv: 6, si: 0, furn: 0, artifact: ['call'], core: false},
		},
		lines: [
			{ name: 'Optimal', heroes: [ 'lyca', 'skriath', 'lucretia', 'eironn', 'tidus' ], },
			{ name: 'Multi', heroes: ['gorvo', 'tidus', 'skriath', 'eironn', 'lucretia' ], },
			{ name: 'Budget', heroes: ['brutus', 'rowan', 'skriath', 'eironn', 'lyca' ], },
		],
		subs: [
			{ name: 'Damage',
				heroes: ['joker','flora','thoran'],
			},
			{ name: 'Utility',
				heroes: ['safiya'],
			},
		],
	},
]);

export default MasterComps;
