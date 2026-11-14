#!/usr/bin/env python3
"""统一肖八数据里汉字与阿拉伯数字之间的空格。

PDF 文字层抽取保留的字距空格时有时无（「1984 年10 月」「1936年12月12日」
「每年9 月」并存）。统一成「汉字 数字」各带一个空格，与原书排版一致。
只在双引号字符串内部处理，不碰 JS 语法。
"""
import re
import sys
import pathlib

STR_RE = re.compile(r'"(?:[^"\\]|\\.)*"')
CN = '\u4e00-\u9fa5'

LEFT = re.compile(rf'(?<=[{CN}])(?=[0-9])')
RIGHT = re.compile(rf'(?<=[0-9])(?=[{CN}])')


def main(paths):
    total = 0
    for p in paths:
        p = pathlib.Path(p)
        src = p.read_text(encoding='utf-8')

        def repl(m):
            nonlocal total
            body = m.group(0)[1:-1]
            before = body
            body = LEFT.sub(' ', body)
            body = RIGHT.sub(' ', body)
            n = sum(1 for a, b in zip(before, body) if a != b)
            total += n
            return '"' + body + '"'

        out = STR_RE.sub(repl, src)
        if out != src:
            p.write_text(out, encoding='utf-8')
    print(f'补空格 {total} 处')


if __name__ == '__main__':
    main(sys.argv[1:])
