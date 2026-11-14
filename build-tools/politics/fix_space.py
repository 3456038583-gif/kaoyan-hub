#!/usr/bin/env python3
"""清除中文标点旁多余的空格（PDF 文字层抽取残留）。

只处理「空格至少一侧紧邻中文标点」的情况，例如：
    “ 十月革命   → “十月革命
    受苦难” 的    → 受苦难”的
    （1） 从实践   → （1）从实践
汉字与汉字之间的空格不动 —— 那可能是抽取时丢掉的句号，删了会让两句粘连。
"""
import re
import sys
import pathlib

STR_RE = re.compile(r'"(?:[^"\\]|\\.)*"')
CJK_PUNCT = '\u3001\u3002\uff0c\uff1b\uff1a\uff1f\uff01\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3010\u3011\u3008\u3009\u2014\u2026\u00b7'

RULES = [
    (re.compile(rf'(?<=[{CJK_PUNCT}])[ \t]+'), ''),
    (re.compile(rf'[ \t]+(?=[{CJK_PUNCT}])'), ''),
]


def main(paths):
    total = 0
    for p in paths:
        p = pathlib.Path(p)
        src = p.read_text(encoding='utf-8')

        def repl(m):
            nonlocal total
            raw = m.group(0)
            body = raw[1:-1]
            new = body
            for pat, rep in RULES:
                new = pat.sub(rep, new)
            if new != body:
                total += body.count(' ') + body.count('\t') - (new.count(' ') + new.count('\t'))
            return '"' + new + '"'

        out = STR_RE.sub(repl, src)
        if out != src:
            p.write_text(out, encoding='utf-8')
    print(f'清除标点旁多余空格 {total} 处')


if __name__ == '__main__':
    main(sys.argv[1:])
