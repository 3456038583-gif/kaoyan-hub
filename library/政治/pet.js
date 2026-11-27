/* 考研政治一页纸（知识点手册 / 解题方法手册）专属双人贴贴亲亲小宠物 */
(function () {
  'use strict';
  if (document.getElementById('opCouplePet')) return;

  var IMG_A = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAQDAwQDAwQEBAQFBQQFBwsHBwYGBw4KCggLEA4RERAOEA8SFBoWEhMYEw8QFh8XGBsbHR0dERYgIh8cIhocHRz/2wBDAQUFBQcGBw0HBw0cEhASHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBz/wAARCAC0ALQDASIAAhEBAxEB/8QAHQAAAQQDAQEAAAAAAAAAAAAABgAEBQcCAwgBCf/EAE4QAAEDAwIDBQQGBAcOBwAAAAECAwQABREGIRIxQQcTUWFxFCIygQgjQpGhsRVScsEWJENGYrLRFyUzNFNVc4KSk5SiwuE1RVZ00vDx/8QAGAEAAwEBAAAAAAAAAAAAAAAAAQIDAAT/xAAjEQACAgIDAAICAwAAAAAAAAAAAQIREiEDMUETUSJhMoHR/9oADAMBAAIRAxEAPwDngaZ1CTvcog9GVH99eHSuoCf/ABWN/wAMr+2voL/cS0MnnpxnI8XXf/lWSexrQ6P5sxD6qcP/AFU5Oz58DSF+V/5oz8op/trIaNvnW6o+UWvoWnsk0Sn+a1vPqhR/fThvsn0V/wClrZ/uj/bRNZ86zou8nP8AfkD0iVqOir1/no4/9qK+j47LNFj+a9r/ANzWQ7L9Fp/mtaf+HFajWfNz+Bd4/wA9r/4QV5/Au6E7350ekZNd89oundI6N0pNuydO2KOpgDhU9GSEqJPw79TXEvaX2yqvS1RbBp+22iE1sXo7CO+WepzjYHwrNUFbBObp5NvTxTdUPNnw7tIP3YobmS4LS+Fm7XR/+kOFI/KoJ65h95TshS3XFZyVnfPjTdyWk/CmlbDRPInNqGA/LP7S96XtWT7q3D+04aHm5ZCtwR4Yr1cvf3RQs1BB7Y4P+6jXoktuKHesIX6qNDpeDgwQfka2tNcPvJKq1moMIqLPsXbW1v8AaGTRjYNMWq+PNxoMaEH3DhKXOFOT6q2qt4DhynJJ8qn21FGCkkelEVo6Bt/0YNYy20OM2m2NtqGQpUpoflmp+N9EjWDpHeuWZkecnP8AVRVXdnf0htR9nM5hpcpc215AVFfUSMf0TzBruHQfa9Y9cWdM+M5wEBJW1zUnJA/fTaNsoWN9EC/H/DX60NfsIdX+4VLxvogyR/h9WRx/ooSj+a66mpVjWc2M/RCtu3tGqZa/9HDQPzUalI30R9JoP114vDn7KWkf9Jq77jeY9rUn2huT3Z4cuoZKm05OBlXrUsE7Y60UjP8AZSTX0VtCoQAp68rPiZaR+SKVWpHRdLn3z7c9EFgOrbaaMYOKKUqKeIkkbkgnA6YpUaNQTi6Q3z9awCfEis0uWxX8nio72mGoJUlOQoZCh1FILhHqoGloBIgW5atkj762hm2gchn1qGJj5PCo1kEtq5LrUAlnEW1AKiQB+1VUay7etEaJjSJUxMhbLPJY4U96egbBVxKyfAY86ke0vVNs0jpiZLnvlLZbUAlCsLcONm0/0lcvLJr5o9p2tnJ8hlD6ErmIy44heCGlk54eZzjlv57CtdBWw77efpIXDtNkxmENw7faIQccZYYUpxa1KGB3ilDBIH6oA3rmld1WsnIJzWMx52a+486sqccOScYpMRCo8qRux0jzh74ZSnHlXqGVg8tqkGohB2qQahYQMjnQCRKWEqIyN6dC3hfIbipN+1KQEFI3PKpKLblODGMLxmsYhI9mW43xhOwODT9m1YGcbeFT9tjOshfEglonBPhUu3bA4x3iMEp6UTUBjltW2e8aG46VKRFB5kDkupJ1rhOw5nGKh5baozpIH1avDoaJmKTBTKQQdiPwoh0Dra9dn10blW+QU4OFJVuhY8CKHVvuFtLqM8Q2V51lb5TNwC2FqCXB8Pn5UQHePZ39J6y35tuNd0ogSuHfiPuqPkf3VdtrvonrfS4hpKGWkvF5pzjQEqyQCcDCsDOPCvlclxTCeHi99PKutfowdrrl2hzNF3OJ7ZJWguRfeCe+TjCkKJPQdfAHwpkw0i97TPj3FQvEpUuUx3plqRHjrW2yoDCONXI8CADwjOCSTvirFYKHmkOtrSttaQpKknIUDuCPlQ8/On2S1l59qA002nuo8KKlS1uOEYQ2knA3OOSeWal7Db1WmyW6A4oKcjMIaURyKgN8eWc0weTY/AxSrKlWJAwCW4qWWnAFobCErUMgEDAJHX0rYHSEjKgVAbkDGTWhDS1bBJz6VtEN88kGlMzLv/8A7mvDJIBOcfOvfYHx0of1hOcsOn50vulOrQ2eFA5qPICsA5Q+ldrp5V7RbI7qsNt5BPTiA+Hw5c/OuPXz3jpzuomj/Xd8kah1Hcpz7xdcfeUePPMZ6eVA0Zouvr8jU2OjU3C4j8NPEQygZxUk1H4QNqk2YaH29hvQGRCwmOJzeiF224iJcA2BqP7sQ38KGKKYD7UmItgkHIooI1aiJkW4nGVte9gc8CnMCMl+OjkFZ+rX0PlWq0qV7QGm1pCieHflnwPrUjb44t89+NIaUhh88QQeh8UnkfGg2Mka2J6LPJCpbf8AFnCG3hj4c8lVLvxP0Y+JLGXrc+Mng3KfOpNWnU3EcDrSXfdwQftoPPH9nSlCtEjTQLLwVIs6tkOK3Uxn7K/Lz++hY6iCV8DaIsl9kg8IS6MfrBWD+YofaeTJgrWvGQ4oD05/voz1fbEMsOqSdnGlJBH2xjI+e1V+827FtiS3/KAOD1xj86yYsokrZ7eqVbFvJBUEqSP9pX9gqCv1mk2R4SkpUG+LCgPzq4Oz/TSxYW2HB77khCT6JTk/voo1lolmbb3mS2MKTkHHI1sgKBztHuZmlKgr307nzou0reJenb/b7lbXVNy47qHmVJO+QeX7qrVAXZL07EdGA24UkGi5pam+AoUpKknKVA7g9CKdOxej6u6bZYucS3Xt1Ul+S6wlbftagTH4k+8lIAAB6E4yR1xRGTtQF2LXtGpey/TNzSQVvRUpdx0cR7ih96aOWJDUlx9ttYUphfduYGyVYBx64IqxN2zLJpVsKPKlWFGgnNpQFsMtqSoZSrOcimcu+LjqYBZyp5fAkDAA2JJJ6AAVIIskhhoJDyn09FKSlOB4YAqG1Bp9y5RQ13bi3kZKA2AQDjHvZOMUgY1lRHWzVUq53VUZtER1hDfeOONFWEH9UE/EfMDFAX0ltbJ0r2XXFxlpPt87EJhRPwFYOVDzCQcedHOmNNXS2urMhkBtSeEqJ4lHwGeg8gK5x+na+7bdOaTYGQh6Q+6fDKUpA/rGjIpyKOVROJJ8otzEJHwnxpWxnK3COpqIlyC+80vO4O9FlkiBzKOE94dx51FsyiZRlZWpBwKl40RSMrBPpXqtOzWHw6IylJUNwOtHGm9KSpLIcLCgg/ZWNxSZFFACLhajLj960OJSeeKhY61RFcLynGlJ+FwDI+dXzD7L/aXworWyT9ps/mKLbT2K2hRC5qVyFHqHCn8BRUhsDmFkvmYJLBCzkcSUggKq9tEWJOpkIjSEtqC0cXvN5KfUVcFq7INKxACLMwpX6xJz94NFVv0nbbWsKixG2SNspGDRxGUaAaxdnz9pWEBxuRGB2bdSSU+iuf35qWuOjIUhs5Z4FEYPDR+llCBnH40wmONgkZFbEaii9T9mLciAtiKCnHwjGwoTjdjrrsKKy8ndo5JxzGc4ro5YbUDy3rQW208sUKA0V3YdOItzTrfDuy+pQ+aQf3mt92ZC2VJ68qK5fdI4iMBSuZ8aGLluvPSkaNRyH2z6fVadSMy20ENykk7D7Q/7U1t0hL9rbdUcKSMH5VfHanpNOorGVoQC/GPeI+7cfdXN0Yuw5EiCsYx0qkGRmqZ2/wDQ37Q1w7dqPTcp3jQw2bjDaUftjZaB+17hx612HZ7WbXbY8d0kvpTxOrP23FHiWr5qJr5Z9kGoP0NrGzyiVJQXUoc4VYJAODg+NfRrTd4TOkT3oDmbYUNITwrUpJdworIJyc4UkHzFXiydaYZPSUNrwVJ+ZpUNTL3boLobmT4rDpHEEOuhJI8cGlTAUX9EbF7QXrei3QJJSJff+zOtKyFcO4S4n9ZJ90+WfKiQailOyUtgJTF4cqXzUo+AHQedDeTtvyrJtZSaQzp9I2/w4W3cJqJiFtxo6gkuhOUNZO3ERyyN9+WRmuYvp8zTO0zo9aE5Q3IkAqHI8SEEflXScWK1DYW0gFQcKlOKcPEpxSuZUeua5t+mTASrQGn2mWwhhiYtCQOSfqjgfhWfQaV6ODIqVPyGkp5kgVfGi7AJURK3E4WnkapSztFu5x8/rCundMNJbhtjGM8655lYBVaLYhLaEqQk4HPFFcSI2kABIAHlUFCeQ0nKjgDrWiZriDASoAlxQ8KRKyodsBDZBwBUtGnttgZIqkXO0lbqvq2ykGpS36tdlYyTvTJDJl5sXhPBhJFeLupJ3NVvBvoUBleD61Ki7Aj4qewhDNvJSDhR++hqZqTuirJ5VGz7qkcWVUDX7UEWE2Xp0xmKwTjicVjJ8vGstgeieuXaM7EXwNjNMB2kzJGUJ2V5CoC1RblqZYNlsbjrCuU24Ex2T5pTgrUPQAedF0fstuzrYNw1AmLn+RtcVDYH+uviV+AqigTbI/8AhRcFqCnAvhPiKnYd1RNawfiFQs3sttLZPfvXGYv9aTOcVn5AgfhUM/2eRGkFdulzrZKT8L0aQogHzSokEUHA2TCya3xsrSeRB2rl3XVrFu1LxpTwpWCB99E87tA1lYbtcLRc75AZVDaccS/JjBQfwnKEpIHNfIZ5HnXt/kWmbZUSrz+kJdwduKkQpaGPZUuxQhJKy2rP2iQMbnHPFKoULKVkf2fW/wDSl5RDQoIkZ42Crlxgg4PkeVfS/Tv1NliILPclKBlsADgONxttXzo7KrXJf15bfYmHHsPjhb5qUkf9q+ir7j0Cx5baWqRwBCEpUE++dgSo7JAO5J5AdarElT6HRhRO8dcMRhTjquNalNhRUcAZJPkB91KtsdLqY7SX1pcfCAFrQnCVKxuQOgpU4tsjsGlnAJxnA5VB6n4nxabfxqQ3cJyGnFJJB4EpU4oZ8+AD5mnWpLoqzWK4T0BPestko4uQUTgE+QJB+VLYyg9fszt17auMyVETGlNPRQO971A4Uk8hxAkZxvjniqc+lnAVK7LEyEJJES4MrUfBKgpOfvUPvqzbU0+1bZECD9XJgSGJA7w8KpKXEJWoun9ZRLgz0IHhQ520hV70fedPx+5PfxVKfW9nDfVpIx9tS0jHh5ZFDwbC5VE+b6WUtTobg5qXg+ua6QsYxDa/ZFc5yshQUQQptQUQa6GtUpmLY2psh1DUdLQWtxZwlIx1NQkNAe364OMR0R2FfWvbegqJatEaMwHrnNjxWuZXIdSjP3moOLPna5nKXClKtlmSDwOpQDJlAHBUnPwJztnnRrp/Rtht7ntC7e1IfG5kTfr3CfHK84+VPGNIe7IRp7SjiwmJPcnOeEKM6+PvSkj8a3LuDUEEtWu9lI+1+jnQPyq0Y2pIkEJQlOEJ6AhKfupve9XQJieBDaEnG+KZQMVratc2yXJVFRKLcpJ3ZkIU0v8A2VAUVN3ltpPE9IbaSeriwn86FNY6fh6rguNOICZSQTHkAe+2rpv4eIqpdAaHY1XOnOXu6SGG4TgZU0gcTildd1bJG2OVI4ByfRbeou0qwWrvEquLch5AP1Mc8aifDI2FQehof8I3zqy+NpedcWRBjr3bjoBxxAHYnI5+WetM9W9mGlo2npr1nYmidHaLrbrj5VxlO5BHLcZqc0KRL0XZ1sH3UMBCgOhBIP40Y6BtvZYbet02oDDhCvXnTCT2uMocCVSGkk9CSpX4UCXixSri+8hbhbZKcIUlW+fGtNh7NQ3IZffnJV3ZCuBKMZI8zVk16wO/A/i9pcW5SA0pxtR5EfCofI0XxUtyWgtCgpJoFVo2yyJIfkILz568RT+VGtniNQGQ0y0W2x0yT+dCwlYX/TseT2waULzCXELDylpWMhXdpK05HXBNaO2q3gPWOQvJ/jQCs+BxRrOaTL7VrKUD/ELbIeWfArKUJ/fUX23Rw7Z7UofEJOc+gpGxUPewa3NStYS5avqY7OGVPcu6QVAKVxD4c/Dn+lXWWobj9fY1RWmZbAcXLWCsd2WkII4id8pBWDsDyqq/ox6Y9g0zdrq62P74yO7Rkc0J+L7yfwq7pNuiS2S09HbU2Wy1w4x7hxlO3IHA28qePQJyWSK+0zYv4UWaPLl3qXES0VMMMxnuBIaSo8OfEnc59B0pVO3fs7tF4mmU4uUwSkJ7uOtKEDHgOHalRLfLB7yr+h9drWm5MsgLLT8d1L7DwGS24nODg8wQSCOoJp6plDqOFxKVAjcEbH5VsPSkTSnG26GYt7SbguakqDrjKWFgH3VBKipJ9Rkj0NaJVht8tFxS7HB/SKQiQoKIKwBgb9MYHLqKlABivQBmiFSaOEO13sdg6N7QmHZ63mdKXJYWX2kgrT+uAB1BwfQ1TN4EmRp9pbki8zG4ndtFxSAIbTgUsLSMHJ27vhUfE56V9FO2rRK9baBuESMyly4xv41FBG6lI5pH7Scj1xXHHZfFYnxL5Y5rfEw+TlB6pUMH5ikaQ0dh5p7TUNOldJXOFBkoBh+zSHu6w0sn3k4V45BHzpjqae/AbEWA0p6UvcISNkjxJo47IZCnezy/6SnEKuOnXlBOeam8haFjyI/fUfOiCUrhRgY6in8KRKknWK+XCGlannjL48qBXhIT4CsYGlZjK3FSpZKlJwlKFE8J8asl2xzVEhKxwetOI1gDHvOKBPgKFjY+kPbbWtuEEuuFxSE7rIxmgrs8s6ZGtNRAgd0uaAR05ZP9arWkcDcZ1Iwn3SMmgnsXZNym3a5pT9U/McUk+O+34AUknoMVste8aRjrtKgy0OPhqjNDKOmdQXHTj4wz3hkRgr9Q/EkehwfTNdWNMccZIxnaqY7V9BOTVtXe0nubxDV3jSgNleR8jSp0UlG9oemwtySFJOM04Z0snI+tV8qHNH67jXhCYslPsd2a91yI4cZI6oJ+IfiKOm5bwx9Q/n/Rq/spyZnBskaF7wRxL8Vb08cQMYAFMZU9URvvJa24jOMlyU4llIHqoih243NWrI67RYi+uI+OGbduFSEBvq2xnBUVcisgADOM86JmatGp/S1zveo8fUTXBFiH9ZhrI4h5KWVH5CmXamgPwbek8kuqVj/Vo3jQW7dEZjMtpaYZQEIQkYCUgYAFCmuWBL/RbZ+FT5SfQikuxao6p7PbazatDafjMpAQIbazjqpQ4ifvNEZAob7PrkxctI20MuBS4rSWHU9UKSMYPywaJKeyDMeGlWVKjYCPIpl7cP0sIARv7P7QV55e/wAIGPPf7qiX73cYciW37G5LRFlBo923hTiHG+Jojp7q/cUfDB8adREAasvHGffEaMEDxR75JHlxEisOo6tkq+068ypDLxYcPJzgC8fI7Ghplm73C74j3t/9HRFlL7oYaSHlg7toHCdhyUonnsORInL7Mdt9nlPx8e08IQzn/KKISj/mUKGpnd2m6QrQ1d5cZqO0h1fACQEA4CQlKSSpZClEq5DPUiiNxptaDVWSDjY9PKuOtbaYb0L2uOOslIj3ZxayhKeEIUrfA8jnPhkkdK67N0hm2m4tvpdhhBWHGgV8Q5bAbk52x41z/wBq0Nd/tYurjqFXBMj2kxm2lFyI0hJCEuLI2x1AwMqPOs1ZuOLdsBp853TF9RqNhK1MORzDuTTYypbHRwDqUEnbqknwqUSoJ7txtaXY7yQ4y8g5Q6g8lJPUU3exIiNuDdLiAofMVBWsXfTZeatbLEu2OqK1W6Vnu0qPNTShu2T1xkHwqan4x0vQvRLSgYzTWRNSkE52oeVdby84rh0k8nPI+3ApH/JmmclWqH1FKI8e2tnbLCC47/trzj5AUbX2PTIfXmon+D9C27KrvOHdhCf5FCtitXgSOQ881Y/ZlpxGm7NGhAYDSd/MnmaFNGaXZhXp+VKbPe8OUrcJUpSjzUSdyaNZ+pYVscS13zaVnkkrAJ+VSlK2PFUWlDfjpYIUoZxUJd22pJ2INALmtWEJ+Pf1oPu3a8IVzTEYiSJbn2u5xwo9SaFjolNa6AiPympqWkhSlYWMbHzrK0aLhgBD024ob/ybUxxKR8gac2vVDuqJceMllaEghTmd+AeZoolxu6VlFawSQrT2d6PiOJkC2NyZPPvZJLqgfVWaKeCKw3wNNIQkcgkAAUMsTFN7ZreqeSOdGxaRsnrGCE1HsaOXriWxbm5nsjyCXkPFHGAUjkRkbV4t8rVzow7LxnVjOeXdOflTRI8jroOuzfRFy0l7a5cp8eQ4+lKEpjoUE4BzxHi60dHFIkVjmqUc92e0qxpUTDYE7c6Fb00dSPCLbRwOsKKHLqklPs2/vIaI+Ne3L4R1ydqKVJ2wpJwdt+tYttIZbQ22hKG0DhShIwEjwArM0ZY7I2/Wx66WhyJHfSy/xNrQ64CoBSFpUCQOfw02f0w2/OkSzOmIXJYbjvd0vhK0p2PvDccWBnG/PBGam1uIbSVLWlKR1UQBXjTzT6eNpxDiOXEhQUPvFYMZyitGUZlqLHajsNpaZaSEIQgYCQOQAoA7V492Ro2cI8qVNacwh1hDCSruzzPujJ3xyqwOIJBJIA8SaSycHfFMZNp2ch2iLLjWaG3Pjux3wk/VupKVBOTw5B8qm4AQlQ2GaOO1W2iPMizEjZ1JbUfMbj8DVdMv8CxvXNNUzog72FLKk45CmcxKVK5VpYlZTzrF97A4jSFiF1BBkyWW1Q3Ah9Gee2RQH/cpauslcm4ISuQs5K1KKj99WUl4OKqRjoSCCdh4migleR+zyVEbS2099SNhnJIHzqftehIkdBLjIUs8yRRszMgqPCZTKSOhUKZTdWWWAstl8rUnnwDNNSDTFbbQxBTwstJQnyFbZ2E86hJHaPaGQeFLp+WKHZnaPGuEpESFHeckuHCUAZP/AOVmBphG6s94MGt3d7ZJqOhJdLiS/wC6rrT2Q7k4B2pRGzLZKudHnZWni1Mp3Bw1HWfmcCq37zCsZo87P7s3a5KCh9IekPJbeQtslDbA3U4pf2d8AeJ51Tj7JSTl0XsXRSByc00S4CAoEEc/Wo/Tkt96NNRIdLrkadIY41cykLynPolQHyqzOdLRO5pViFZpUoAdMaPbtUWyNCZQwh+LIceSgnC+EthORnGxUal33XWnmkpjlTSzhTpcSkI+R3J9KFYN0VcNTWZ9zuyA3NhJeaJLbxAaXxJJ3I91Q9UnFOdR2mMi52GWULceXdWQpbril8KSlfupBOEjIGwFa7LSh+ST+v8ASQuUvT+Um6P2xSmiQBJUhRQeowc486fwocOJH/iLLLTDx736lICVlW/Ft47V5ItMaVHmNJYabXMbW0txCAFHiSU5JAz1prpuYq4actchYIdVHQlYPRaRwq/FJo2TdY2iCvN3Ls+cmRDeXbbLwvupQoAOrACgSeuMghHMnc4AAOF3k3VzUUqXDZSYtriltKXQcyHVELWlHnwpSOLfc48agNQpvFxF3ttrafMl+4PlSF5bZW0A2Q4pfXkEBJ2JJPSiq63OEtLC5FucfnlsPMRlsErKlfZBIwCDzydudMmdNKKTIrWMNrUmllSIx7xPdplMqHUYz+RqhVnC9q6NskBdpskKE+sOOMtBCyORPMgeW+KpDWOn5NhmqdW0BGeUShSDlIOfhqXNH0lCW2iNiveJrKa6e7JTUU3KKV0/S6HU48a5zoTsDb5reNYc8biQ7/SoNX2tC7S0RRPCePYYBSjPrVo3ayxZbJLkdtzxCkg0Gtdn9jU9KLcdptUptTTgI2IPPHhTJWUjFvobW8vXZlb7cppSEKUk8JycjmKwSw69ZxLKl+0qZLgYJweLGeH91H8bSDgjtFlqKlKEhOc74pw1Zo6Bwyp7aEJ5hCMmqYjfHNlU2DTdy1lJZkkv2+ztthbhV8bqiM4HgB41aWldPW+2SFKjsBKuHBWdycedZyJ0ccEKCgojJ5k81+Z/sqUtqe7a4vtK/KllS0aSxVenk4EuZFMXZBbG53qTlAJRxGhi5SQlRwaQgx6w+XnkpSd1HFWRpzUD+n7V7Q2h5qOXkhtDSG8SCDlzvN+MpDe+cYBPpVXaUaVcb9EjJxlxRABON+E4q17Ro29x4khS20h9dvVF4FPIUl0FJyknmnmMY2yNyc1XiXoYOO8i4O8BJA5dKb22IqE5PUVgiTKVISAOXElIwfPKT99aLat0wovfp4X+6R3iT0VwjP405afcU66lbJQhBAQsqB7wYyTjpg7b1ds4rrRIJcOKVaAvalSgB2RLS+7YophORLpBnNn2ZDSi33fCpC1IWBwlHConmCORGaJblbk3JqOhTim1MSGpCVJAJyhWceh3Hzp8CcYyceFLFGgym3QyudzbtMRUlSFurBCWmW91vOfZQkdSfw3J2FNtP29y2WSHFeUlT7aSXSnlxqUVKx5ZURTpNtjpmqmKSXJJBSlbiiru0nmlA5JHjjn1rcTtQ9BeqRg6cjBO1M1qIJGTitzysCmji8VkKaXtqgr1bI15gPwpSctOjGRzSehHmKl3V5pm6nJzTdoZHNeobPK03dXIUrmPebcHwuJ6EVhBf4iBV0620xH1NFbjvOMsuthamXlKwoL2wPNJ3z8q599pctk52LJSW32FlC0noQcGubkhidEJWGJ3a86gpkUIWrhFSUCaiSke8KlkQG5A3xk0i0XjJroCFTZMdJCSs/OmqJM6WvhS0rerHZ0wwpRUvlUvEscJjBDYJ86Nsp8jAO1WSQSFupOfCilqCWmyrrRC4iOyjZKRUBdrsyw0vBAxQJtkJeZQaQU5oGuFwClEA1lf78X3lJQcioNnikOAmsTbCnS09UO5xpafiYcCx8jXWMd1LiELScpWkKHod65LtjHdgVP33XfahDgsN6SdsjzDDYQGZbH15x4KJ4T6bVSEklRKcb2dQtqrek1xCx9JvtU0tOQ3qexwuAnHC9DLSV/suIOPzq/OzL6RGm9elMSaU2W7HkxJdBad/YcOBnyOD61VEWXMDtSrFpaHkBba0LQeSkKBB+YpUQEyOdenYUqVEBEvyHGr/BZSo93JjvKWknbKCjhI8PjPrt4U+WcUqVAIP3GW8i/22MlZDLrD61p/WKeAD+sa3LJNKlWQ0ukMZDpbQtQwSB1qNus12Pp+ZNbwl9uKt1O2wUEkilSpzI0TIseSiOiTHZfKmt1uthSjgA/nvXPfbBFbjauccaTwqkMIdX5q3GfwFKlUuX+JWPYH2i4SEOABe2aPbdPfwk8VKlXMi0QganPKxlQreqa6BsR91KlRGZF3O4yEtkhdVtfrtKccKC57p8KVKswMgke+r3t6m4DSMjalSoCBHHQEpGKk4aylwYNKlWMe6qgsXPTlxjSmw40phZwehCSQR5g1yUw4oIGDSpVfj6Icg9buUttPCiS8hPghwgfcDSpUqoTP/9k=";
  var IMG_B = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAQDAwQDAwQEBAQFBQQFBwsHBwYGBw4KCggLEA4RERAOEA8SFBoWEhMYEw8QFh8XGBsbHR0dERYgIh8cIhocHRz/2wBDAQUFBQcGBw0HBw0cEhASHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBz/wAARCAC0ALQDASIAAhEBAxEB/8QAHQAAAQQDAQEAAAAAAAAAAAAABgAEBQcBAwgCCf/EAD4QAAEDAwMCBAQEAwgABwEAAAECAwQABREGEiExQQcTUWEIInGBFDJCkRUjoRYkUmKxwdHwMzRTcoLC8eH/xAAaAQACAwEBAAAAAAAAAAAAAAACBAABAwUG/8QAJREAAgIBBAMBAAIDAAAAAAAAAAECEQMEEiExBRNBYSJRMkJx/9oADAMBAAIRAxEAPwDvyo613uFemnHIL3mpbWW18EFKh1BBp+pWPtzVfWO0y4SHLradroXJebXHUdokMeadqgT0WMnBPUcelElZaVlhikaDmNRXd7ULFv8A4ZHQ2U+Y+DIKnGm+gUcDbk9hkn6UWqWEJyrpQtNEqioviN1sNH+HlycjzUxbsWg/EyvBcKHEBQA7nC+lfOCz6jvdjfMm23KVFddQULUy4UlSSQSk+xIziul/jY1W1eLjpqBDd8xhpD4cSDy26F7VJI+g9fSuZoDRW2jKTgD0raEeBjHHg6x8Ivi/lRmoto1ujzylYT/EwQFlB4+ZI/MR69Tz3rse33GLdIrcmHJakMOJStLjSgpKgQCDx6gg/evkwYDchBCDhf8AUUW6W8TtT2BhiyL1JcbbYnMNSFRPmWlsEkAAkf4iOoz0qnAqeNfD6Vz9W2K1vLZmXiAw8j8zbkhAWn6pzkUPah8YdE6agqlztSW4Ng7Qhh3zXVH0CE5JNcRXzxj0PY1OswZ+qdROqSgOSnH/AMC2SB2S3tz0TyfTPNUJctauXq8B/wAlwN4JDbjy3cHr1UckHv71Fjsy20fR6H8StiU669d7DqO02pvBFxdgqcjgHoVqRu2g9c9PerEtmv8AT10hsTrbfYlxgvqCQ6w4le1SuEhWMbcngZ7nBr5N2vX10gXHZElLZaJHmR0qKmXAOdq0EkFPUkHINTL2tl2dx+bbEi3vyeXUxztbJOdwSkcJScj5ecYHSreIm0+ukaUiS0lxCgpChkGtinkJUEFaQo9BnmvmzYvjb1dZdOtWxm3wXXkE/wB7kKWpagTnnBGPt+9Elg+Nm6+cP4tFlpBwrFvLCUn1HzoUSPqSfeg9bKo+ggII4OazXL2m/jH0jcm0JkPyIzoUlKkz2NoI7nzGspHbgpHQ81fOlvEHT2sIf4m0XJmQgDcoJUMpHr9OO1U4tEoJycVXniR406V8M7U7LudxZclfMlmE0sKeeWDggAdADwSeB9aonx6+JwQkO6f0VIC5aXlNvzmyQEhI6II4OVZ5HZPvXIc9M+6PKl3OW5JkudVvKKiBycc/X+tFGFhxx2dUS/jTcvV8tlrgwBbbY9Jjok3JasuBAUC8UpIIAIyBnnBz1rsK2Txc7fGmobcbRIbDiUOfmCTyM/bFfHmez5CkKb6pUDX1S8GtXnXPhvZb4UhtUlC07AMbAlZSkfXaE59yako0ScKCnU17TYLNJmnBWgYbSf1LPAH709tzkhyBGXKCBJU2kuBHQKxzQldwq+awt8BJKolsH4uQDjaVnhAP+vent+1A+w9/C7U2JF4cAVsUDsaQf1qPb2qtvSAoKqVRdkgSbfAQzKlLmv5KlPO8E57AelKgdAkDqWDf7rM8hhmIq1AjclbxQp4eiiBkDPUDrTmFeVxcW+ZAECSllSmG0qCmlpSOiVDHT/DjOKJ6iNRWNu/WxyKpZaczvadT1QsdD/t9DRJ/GEpfGatKQ2mrLGk5KpE1CZLziuq1KGefpnA9qYa9vjNrsUxH4qOxKW3hlUk7Wi5+lC1fpCj8ufendks7zem4VvuKSHWWwg+W4QU4J2kKGCCBjpVDfEem+ac0+7IVLVcrGposvIkxAXQFYGC8kAKH1APHU8VXbLVNnFviLcXp+rZfnoea8l1Q8h5RK2lZ5SfcYxnuMHvUfCuDwSEJDaE+p71BzJhffW6XVLz0KyScDgDn24poy+646lttJWtZCUp9SeAB75xTSVcDK4QeIlJADi0pSgEBSx0/etd2ch5SA+1/MHOFjmhi5JjWide4E5l+TMZUGWHUvFtLLiVAK3Iwd4wCnGQQcHPUGJajADc+tR3jIQhW0Afbk1dMzcx3OtodUssIW8B/gBUR+1RKIj6HgpLJb7c/9zTpTcdGQ22Eg9sn/mtPkoSoqbKkEjBKFEZokZylZ4DbVrC3MhT6xzmoaU65Jc3EnHTFTnlKCdqXCAf8XzD+tOItoFyUW2y2iUhsqQjdtDuOSB23YycZGcYBJwCQO4F1NKcU22j85OKm3of8NYaDqgXlDp6Vut1kmJjqn/h9zba/LQrsVHpk9Bxn9j6UzeivyX1uSXQyhs8lw9VelXREOorjiVp8snNFNiuF1hqeTEnSYrbySh1LLhSFpPUEChqMWI5CkrcdHs0RU3FvLTKOG3R7ls0MkHFoMLRbUhpa9oOwcKPrWmQqOlwqdK1HptTTP+00RyE3Eiu7Fn82/gk/Som5SVsJSSrBUMg561mkbKSHNyXHdGEIUkDsRXYXwi+J+7T8DSsrY21GUWIqEklyS64sqPy9ghAUSRxzzziuHjPU6nBUfvV4fDjfHbHf1SI77cBav5Ts9SA68WyQfIjoPAcWQMqORgdKHIrQM+UfRedbFMMXB+0IYZucoBXmrGQVAAAn7U1s9phaYguPyH0F935pEt5WC4evU9uuBUjaVly3R1bXk7kA4eVlYH+b3/0qKa0bFekmTdHnbi9uJR55+RA5wAgccZrC/hgn8PLmt4QI8luVIbIyHGmiUn6ZpUSoQG0hKAEpHAA4FKqJaPVKlSoQRtNEssKENbCHuxeSpSf6EGuNPim8U9X2tCdGpulrImtlcxMCM42Q1nAC1OKPBx2A9MmunPFLxLtfhjpeXdrg6nzgNkZjOVOukHAx6dyfSvmFq/VF01pd58+4S3HFTni88Sfzq6D7AcAdAOBWkFbsOMfoITFJUo+WAVdyOlarc4qJLEv5dsQF9QWMg7eQMe5wB71smJTG3Y5x2ppbW0Xu8WyylwNfxKazGcc67EFYB478qz/8a3bUYuT+G34ONOlN2YkQnnFquD252MnBVuX1U2Oeqhkjg/MkDvXkHIH06+tdE/EN8M9k8MNKxtR6Vmz1IjLQ3KRKeClcnCXEKAGDuxx09Kq7TN00rqGQgamQqLPcc8x1wPeS3IJHJCsYQVEZIUQMnIUM7az0mrx6nHvx9A5cbh2AxFeSoCrvvLHhdBtK3mdI6mdf2p/mfjylpG9OUEq+Yc9QCBkdKpJ1hxshKkKBHUEY/pTSFkzyFitzTymV+YlwtlrDvmJ6o2nOf3xTZQ2ZyOnWm7rrcra20veyj5nXMYCueEj27570TQSRl28XSTCLYmSW4Id3ojocIQFc4UQOCoZIyeeafs7ZUaM+Mqwg8EfrAwf+/wDNRr7RRBYAGQvLhHoM9KlrK6FxnIKhtLqvMjqJASlzGCknsFpAH/uCfWoFR4KjySawh0hXCiK0LKkZCgQoHBB6g14QolXFRg9Eo0DNWlnykurVwAoZqZOmJcZlTkGSC5jJjOjc2s+g9K9adLEVJc4U4rH8w9Uj0xRayjcAoEBsc7yeAPWgaJvYNf2VRJhMSXktRHHUJcCErwvChkHafzJ46irN+Gv+wtvvaLvq+6TjKYcAiW6JEdcBP+NakAn0wkc1WarklEiHBUp1bpZdeWELAUhpKVLAyc47dugIHrV2fDB4yQtBzW7VeW2WocgpR+KSyhK2yT1UvG4jk9+BWOQ1i7R3tp69Q73CbegxprMbaNn4mI5HyO2ErAP9Kme1N4UxiZGakxnEPMOoC0OIOQpJ6EHvUHq26Bu3uwIy0quc3EdlpKvnyrqrHUAA5JpVJtma7CPGO4pUIaev8WHaI0S6Tmos+KCw63IdAUSk43c9QQMg0qLbJEoL68OuBptS1ZwkZ4Ga914daD7a21ZwoEcUJR8//iCF61rdrhqWYzJ/gsQlmIhxeGwEnBXngcqOAkck/wBebnpKkDoBj0rur4w3Ylo0ZBgoSltpbyUMsIG0bgCSogdcDj6qJ6gVwG8hycvahWAT75rfHybJ8EZcJKpCyBkrWcYxVufDl4P3PWuu7VMVHd/htrkIkS5SkZQjZhSW89CtRA+gzT7wz+HjU/iBERcYDMWPbVOFr8bLXyCPzFCByrGfYZrvzRGkbd4f6dh2a2MNNRIyB+VOFOLwNziz3Uo8muH5jy8cON4cTtvhjOHC7UmUL8Yd/ctmhGLa62fKnSEIUrGQAk7/AP6gfeuFZrrZbCiAE56J4Ofevp7qx61325GJdoceXC4/lvNBxJ99pBqBunhd4Om0uof0TbtpScrahrCxx1ChyDXL8X5qGkxLFKNsf1mjyNRl+HzKbde+dqO4620pYX5aFkJyOhwOCR61Iyrzfbq803Ku8+UofKA9IUvaPualJ0GJEkTBDbX+FQ6tLZc4URuO0H3x1qd0hplpxtUuUna8vhlCv1Dpk9gMkAZ717X2xS3HJjhlNtRV0Bcu2yBIKJDjqljBws521vhpSlxuLwRyeOmaJbu4y/eJTZRsC0AK9lVAwQmLLS2+j8xT35T/AN9K1UrM+h5JiKTHQrblAGzdjA+n1rU2wGUqDqEuNFAJSD1bPXHuDRdKtrcu2yPKHzqw4nP05FMUxgYbTmOWsjIP5ge2KtMH4Qslt5xnepozGwBskMqAcSkfpUOh4pmy80EhSd+OmFJwfvUq1DWwsllZSn0/SftXiS03u8xbBaWerjYzn60SQLNTN1ZikqEhoAdQFipSTqxqLDWwwtMpbgzhsHYk57k4z9B/+xiYzTiN5hhxGOVpOc/XoRWxqBHWC422Eo9jkiqaLSISBOfNyfnOv/zgyvJV+oHCSn9lH9qLbT/fVoU0vk9DnFDVxtjYBdbOVAjgg0+0xLXElIAwCCCnPSsprizWPZ3T8Leub/bVxtNXXzH7RMWtEJZHMd5ABW1z/lIUB3ByO9X7e7Q3pIOX62qcSpDqVSWFELS62pWFYJG4HnI5wMdKF/CODatT6Ytd9ajh1m5NMuyEhIAZlNDAcGOivlIJHXI7dLZn25i5wpEOSkqjvpKFpzg4PvSm5WZvsD7dp9ep4bd1us6eh+VlbbUZ9TSGms/InHrjqe5NKjSNDbiR2mGQENNJCEpHYAYFKr3kscVkVisiswSgviM8H2tfQZd7fffUq129QYZQrCUr3ZUsjvhOeAB96+dnnC3pWyUZWheM9M+49K+xchluQ0tt1IU2sYUk9CO4r5C658r+017fSlCI6prhbbbztCNxxjPOPT2rfFzwaRO4fhlmtSfCGxKLg81hyS24M8Z85R5+xFW9JfQttSPMGSOgNfOPw28b7p4f2K5wI0cPxpb/AJ6Bu2lte0JP2OB9xVn6X+LINNpbvkFaHBwXGBvSR6+o/rXjtd4TUyzTyRVps7GnniaW6VM6DW05H1AsMutN5IwpznB/epvVV+uFm01NmouVvSqMypwb0kAkDgZzVBr+JDRkqT57i1PJOMpUyo/XtQd4xeMth1rptq3We0KjtlYcVJUCjKQRwPXNL6XxOoeaKnGkdPW6nFKKaadIp2NAf1Fc35bzX/jOlxTTSQMqUrcrAzz1NHkCGyLcotuqQmS0EbwgJISk5HHbnn3oZ0xLDhI3oG7KcuZxg8HGBkHGcHtV4taQstz0oHI98Cr2ygKbZcV5UdSOhbQ31SSB+cknOM8cV6vVQlxGPwz8Hq9Pp4y96Tb/AA53Va2rjcpqo5ckeashC1I2hwkZyB6cE/tUHdYZDiXgna42QlYPVWKtiy2d2yXmO+8wohsIRIbKk/KCMJ+vGB9xS8RtIx0tJudvGYT6ysLHA6gLH1BwcfUU5inykzh6pRlkk49X8BWyPMSIbauSR1xz/wB//tRGwtzJMdsqJCt7aRn5geoP71qitqtUhTbyg3zwrGUqz0P3FEUWyrnwI0pxtxClkhh0D9Seoz9D9Dz6VvKcYcti8YtroHktbU7skNq+YKHOw+h9q0yysnlOzAxuScg/aiILShtSJSeCraVpB2qP+30NQd6tv4IlTEgKQobhg5wDxWkMiYDiQjSXN42k4PRTfSt7jBWAtHyOJ7EYKqaJddZd3pPzjug4xU7BniSkIfjlwgcKBwR960bsFER5ZfGNuD6HrRd4Y+G87XOoFW2CEqlBBU2lRxuOCQnPvg8n/iouSwyhQdSHE+gUMiuvfgs0vvkXvUSmP5akiOy7nosH504+hBzxS+V0g7ov7wN0O9oLRLNsckF9h1f4lreMKbCwCUH3Bz/3pZdYSkJAArNJGbFSpUqhVCpozKL855pGC0ykBaufznnA+g6/UU7qKhOqYiRlpaSpyU7lXb82SSfcAVZCVWgLQpOSMgjIOCK+YfxVaTGnfFC8fg4wYtKgwljCdo3eSkqH+/0Ir6eg5HSqF+Jey2m4WK1Sp8BuSuI+48kFAJJ2bev1I6+lEpqH8ma4oPJJQj2z5ePvFtGK3BYU22FHGRU/rCyCBeXh5amml/zEIWMEJOcUys8H8feo7BjuPxkEKcS0rapSfZXb64NOb1t3EcGntZJ22wO/gmJTiFBt5WxtIHKyOv2ous+jrrrO5xmEBZZzs2tAK2J9zRtetPu2WNEu6rXOOkY8VZkrgIYkPsKwAk7XcJ25KtxKVYGDwQCH3g54fHUEe2Tb3OuryvwyQ203KVHbYaUrIbJQQpeRyckc8c4yU8meKjuTGIYm3VBTp74frVIHzakbjLaHKmn0L8s8DaU5yDxzUTqLwXuNradXbdYwJTScqIL6QpPsckf0q8LfG8ItCSXEuw9PRZTuNyDGQ64s+uMKVk9+Kl5mpfCZ1hP4qLYIwdJQhUq2IZSo4zjctsDOAT16CkFnm+UbSxpcM4zeN6skgqklM1hwFO4KC21pxjaccfanzd+kC2qjyC4WFlOUrO7njGCfYda6A1L4Z6LvOZkG1QPJdO9qRAw2D/mSpBH9K5+1ppKVopyOt591+yuvBrc6QpxlZJ2c9VIyDu7jqKYxZlJ/oLxbRk2pdwnRlQS3HU2A2884gLSEqIByjB3DnkdasaTqDS1usl5Fut8WYq0pElmJNy22/wDMNy2wPTKjgj7Vi2WG0wWNjFzgy3XUkSEsb1KOQNvCkggA9D3GSegoBuum3NQX662uO2l5y2L8qY+2vaylWSDtXyFHAyMBQ+g5rLNghnknN1RpjyvHFpLsHJesoEzznlRAlbpJWhKAlAJ7ADoKGX7gZTqiwhXpsPORVjaK8I5uobo7GbkqZEfKVvojpId544VkAcfWr2jfDfcWISfweohHXkkly1Rlgg9eUgHn2IpuWfHh4TMPVOf8mcWzN6VeYG1N4PT1NeWJ7gVgk59RxXQPi94Xz7I9Bckv21aXjtSGYy2PmSOVK5X8uPTkmqhvVjjW6K0pxDsWW4QWy5tLDoPUB0EgEDkg4IHUCmseeM1aMJQcexzaZSJbAaebDiQO9fQD4VrM9ZPD+LmCURrl/em5SFBQXyRsWOoUMdeQQRzmuANF2W63m6x4VrhrfkvlSUN/+ptzkJV0J+U9D2NfSX4fX5qvD23s3GJ+GltfKQUFCnEfpUU9OhAyOuPXNBmkZstmlWiZLagMKffcS2ygZUpR6Vqg3AT2i6hh9tGflLyNhUPUDqPvil6KHlKsZpVKIZqDjlfmWhBwnYXUqTnPKUkf9+tThodmuptlxaUoFLLrodSoDgKxtWP2IV9jVoEJO1APi3Yf47o+SkJy4wfMAx1HQj/SjxBJTz1ptc44lW+UwUhQcbUnB6HihyLdFo1xTePIpr4fOjx38I27ZAN8RLW7cX1pyyPypb2DgDsc5/b3rHw3+H5ul1TdigLjMOKiqSf/AGBQP0611detJ2q/PtruA3J8hKwjOMnb0qqvhaUm3WzUVueaKHW55SEq5UCAAQT60os8pYHH6dHJjXt3otWV4Y2+52ibaXWd9rnsrjvMhZTlCxggEcjjpitUDwzhrskGPFcUlpqOiOML6hA2de5+Wid+5OR7itbT4SlsIZCV52gk5Jx69Bn61M2olhT0FKEBTDm4JxtHlLJII9cHKfcg0rKMoJJv9Dk9rK20/wCDtm01djcIkdKbhnzDIdG8E/frW/xT0WjxI0muw3Yxm0BYdZfjhSXGljuAeDkEgg8c1bRaStOCM59qZG3pU4vclBTxtwOfvVRyzj0wLhL/ACRz74P+DUjw/XcYguT020SwFpbWnHlOj9SR2BGQQO+DW7xAsrUiam2xmUPPoKCpW4Hyyc4465GB+9X+40hmOsBISQOFY6e9BFusn8b1eHF4VHtfLy8YC3jjKcf5QAM/UGiU25bmE5JLhAY/4Gpsmn0PQ3ViUlsqW2o/L05/pxQ/o7RNucefYgJdVGeUJDy3Vbgt1Q+cc4PGBwRwCkdq6inQ0yWTuUvaEKSWwflVn1+lVLpu2sW/Ul0jhltp5SkrUUgZdGMZJ68EY9ORjvRuXHIGGfsVsH4FsNtfVDgsrhx2wUmWtgqLivUD0z3P2qofG7VfiTp/UUCLpjUjrtsktJ/8vHbPlOZwrflBx2PNdUyrPGZZW+XSlKAVKcWroPU+1NRp+NI2urS08CAUqUgHihWZQd1Ycsal06OPrTeNWaulrtWrCqb+D3ojSg0EBwKGCo46nihO+6NvDp1qiAx5ibfFiyfKCCpXnmQgNLAx1A3k5427s8V3HK05AL5QiOhDxT5mQ3gYHHWqM8YidL6U1fItocYkaglRbcHGyE7m22huBz+lSnVDIIIKe4BprTZtz4VC+pjSX09/CH4bXKfOuOvdRoTIdloS3Df2BvKkLIUoISkJI7BXoD079iJRhOAMdTx71D6UskPTen7Za7e15USHHQ02g9cY5J9yeT9am+tOSdsRfJFM2krm/i5hS842T5Cf0tDPUf5sd/sKkyodK0yZaY4AwVuH8rafzK+gqKnSfKSh2Y84kLIS3Gj53LV6cck/0qiE1xSoYVYpk4+f+NkW7eB/d2FZAxxknur1xSq6JRN3V5bNumKacDbqWVlCyMhJ2nBP0NBEHVseRZm2NSF2NLHl4fLKgl4HBQ4kgYB5GR2NFOodPi/oZbcmPssNncplASUO+yweo9ulDMSXOkaut9pvLTf92adeZUyMNPEYCXNvYgbxjscEUcUqokQss91D5XDfT5cxglJGCAsA43Jz1H+malVgkVFToBcltOJCinIyUnltXZY/0I7ipNsrKBvIK+5HSgaKKtv1uLE+VFk4DPPlOgfOgK5GD6DPT2rmxKV6Ek+IcZzznFy8FDrIII84EBee2Ouexx6117q6ySbgG5MIJU+yNpbJxvT7Hpkc1ReoI8G4a0FqkB2NNnW9SJEdYKFlrdtC0569xn2pBR9eTlcHUjOOXDw+SztCyZl809aLpLZRFkyWULW2D5gW31B5/KVZCu+M0Uvw2XXmiFeXJwfLWggLxkZA9R0yDxUBpCCqwWK0WpTjkkx2Uxw9t7JHBV6cACnWsJmoYFlXJ01GhS7g185jSt381IHKUEEYV9T2pdvfke0CSaSRuefmxbgw26qK44ttfltB0occwRkhOcYAx2JH3rQ3c74t1aTZ2SlCtpIlEEd+6Bnr61zDO8SNQXjV0LVD6IzUqJ5IZjslSUBtBPmN5UNw8wqUDnOPl9Kv7Q/i/B8QXpseHbZjIipCjJUpDrCv8ocScFXt6c8cVrl0zhFSD9c4pWh4/Hv7z7jSDHhR3F5C2yVOJB68k4BzzkD/AJoisFthM2wQWWd8XBbUl1JyvsSc8nPr3psw+oOgSigOEZG3OD9M08ReozT4bS42pwdUBYyB9KWTCyQbjSROyAQhotl1W1YBbaCeQeOc9h149O9AOtILtru0a4xM7lJKVA8JXx0P+vsR9QSlq8NIa3vBkycYUttOAef3qHu803lvyi6jykBSsbeSccEH2pieSMo1Rhp8WSM7fRHwtWxhGR+NQ7FUB8wW2VJHGSd6RjHPU4z6VJO3eOtCCw8w4pZSQFOhGUk8kZ9s/tWITCpVqKW1ht1ScJcKArYfXB64qh9Or1JcNaR57r7jbFweMMTnYmWXEoJOEJPTO3g+5POKWk0dPDp45d8t6W3+/pfrs6Ok+VvK1kbtjadxI/0/c4qrrjpl3V/i9pBibGSbbbkPXRbXCkhKMJaSrI5O9eT2yTgcZNpuRPLKC24QlJztHRVPdNwEJnS5u0eYUIYC++ASoj91A/emNK/50c3UVscgmSnaAOwrRLk/h28pQXHFHahAOCo/7fWt5JxkDNRcx9MH8RPkAlSR5TTaep54A91H/b0rpo5w1kSDb1JTzJuswkNp6Ae3+VA/rTu32cMO/i33PPnrHzPEdB/hSOyf+mmUVtVsQuVNIXcpihlJWMA9m0nslP8AXrTpibJcltshbSlgguIbTlCEd8q9c/8A5RBExilWaVCDZ4IzWoxGVvNvKaQXmgQhZHKQeuPrW6sihLMYwKVeqWKJIhgdKrfxR02zKds+oG2AZ9rfCFOAZUWHAUqHuASFe2CasjpWiVHblsLZdSFNuJKVJI6gjmgmrTQUXtdgDCubMdDPnOoR5iktpBPVR6Ae5qYkMrmN7UyC00ttaFbEjdkjAUFdiOtU54kCdaBHaMkeU0/s2BAz5qMqSvPXkdqPtFXy43q0svXKM2w87lTZbUSHUDHz4/TnPTNcRTcZuP8AR38ulrBHOnwyv7l8PdjRp+Ra7TeJbV7U1luQ+oKRt5G0tJwAk9Nw+YdiehsvRFkesunLXEnhg3BmM22/+H4ZC0oAV5YwNqcjOMDkk96lJ0oxWlO7clKT0HNVlE8X7dbLg5GvJkRwpwhDyojgZA9PMAx9zW7zSmqkxapyVFoSosa7R/LcbcSEqKQogpUCDjj2oLk+GVqiOOT46C3MTuX+IH/iD1+bqanI2vdPyU/yrnHcPo2oE/tT1jUcKThtL7YXjk5wPtmgoOGPPD4yvnbPf5DYLEgJZPIcOc+3FZ0xoqVZZsiRInSpBnPBTgO5fzHvk9B+wFHky4RI7SiJDPmdgo1j+MREtbvMBx19qurNW5tXRIx4zcMl1IO4pCSc54HSmd61DDtlsnzJqwiJFbUXlL4GMZ2gngk5wPc4pkzqBu4xFPwpEV4tqwtvzMHA6nPTr2oa134faY15KQuXcX2JURlXlhtewO7s7ElSspIC+emfetsWKMpLfLgQzuST2rkkdLa8t+ptONXNlxtpSW0qlRgvcuKSSMK9Pyk89hmrG04jNojPFGxUhPnFOc43c/6YquNIaIVpuwW2xpS28DhD8hpGEvLVkqUe5xkgE+lW00kIQlKeEgYFNYsajOTS4+C2abeOMX39NmBTORDS/IZcWSfJUVISem7GAr6gE/vTsGkRTFiwxFubWt9T387zeCHOQE/4QPSnTbSGk7UJCUjskYFe8UqjCM54FKsUqoqxVkVikKtFEe7foLF3atTju2a635qUkcEZ9fXg/tUiFA9OlBepLQ3dtTQmFfL5sR0F1Aw42UkFC0kcghR9vTvXuVd79abe4qVHhYjIy5Pcdw250xhoDdknjbn6HmtK/oKgxxSxUJpaTdZNnZdvCEIlrJUAlG07M/LlPY47VN5oGigB8QLOApu6+Q2802QHkKSDgdAr7Zx+1QWmlM2q3Mw461FhskNhRztTkkJHsM4HsKteQw3KZcacSFtuJKVJPQg9qp++Wl7Sl2Qgbjb3ySws9v8AIfcf1Fc7U4P94nQ0ue16pPgKkoVMeSpUhQa24LWBgn1z1rc7aYbrSo6m0HIyUf74oXMxZcaeDiglPKNnJJOM/wDFF0JbjsZtx1KUuqSN2OftmuZjzbpuNVQzki4U0wCu2iYaHVH8M2tsqzgoGf3xUOvS9tT/AOXfmxVjqPM3J+wVkVZcsOSlvN+StIRja4ei89cfShK426cHSGwVAn0puJ0tPrZNJSkB0jSDaGllN4mg46N7Rn9waaW/wpi313dcnp70VPVLkpYCvqAQCPbpRpDtc0r/AJwSBmiNcVSbbJZbIKltKSPqQaqcmotoPNq9y2RfZH6LsNos9tacahNtxGyURo4TtQEjoo+9GSrjb5bKUqbbWhYPyKA7HB/rVJx9VMWpiK1NusWJ56ShCJjnlpCkABWCeBjPQmiO53q1262x3RdYDaWuNzslASsHryT1zzXIWr08XjVvlvd+C2fxz9nMuw2szkO2ajSxvd2zGymP5hOEkclIz6jkfQijlPSqP05MkXvVlhLb6X0BwyjsO5KWwg/Nn3JH7irwHSu/4zNHLiextxTpNnJ8jp1gyqF80ehTW5XBm1QJM2QSGWEFasDJwPSnBUAMkgD1NBt8fRqyW3ZoTnnQG3EuT3mxlvYOQ1uHUkgZx0FdNLnnoRSCi2XFq6wI01jd5UhtLid3UAjOD707oCs14/sbBVbLrFlNR4rjgamNsKWytoqykkjO0/Njn0o2hTWLjFalRnUusPJ3IWnooVco1/wjRvpUqVACKo6+TnrdbHpEeM7JeQMIbaSVEk8Dgc49akaWM1EQBrVKlRXXbhMst2flOISlUhSUZCepShvdlKB1x1OfWt1xuLF6uemW2HA9bZLzri+oCloRlKVD2OTtPPy0ZbRQNqHScz+NQLnaBkCSh59ncAAoHBcSOmSkkH1rSMkw07DlPSs1gDGazWYFCpndrVGvENcSW2FsuAgg9R7g9iPWngr1iqastcFQS4EnSU9DEjc5EKv5EnHBH+E+iv8AXrRNFnh0NbAkoVncrcBt44475owmw2J0ZxiQyh1pYwpCxkGgG46OuNuWXLSr8TH6hh1eFo78E8EfXmkM2m5uI9i1CaqZMKfQkHJFMnJJDiiVNlvA2gD5gec5Pp0oHuN6uNvfUzLgTmVoyT/IUUkeuQCMfeohWt2V9XkYrBQkuBpOPxhLddQl5b8QuoieWc71OYU4OcbRjGCRjrng8Vuh31TltTJkpQjzRvSEEnCD0Jz0OO3ahO3ofv0xxUCA7MeewkqCCpOAMdT8oHrzVj6b8PlsrRJvO1akEFuIjltGOhV6n26Uxs3xUVGhZZPVJzlK/wAAWX4WPa6hzHy0yzDk/MluSCPNXz/MSR+Q++CD6YoGtfgRHtl2ct8uMy3dnUpXFS4tAZCStKcqUhJKifnwBt/KM9a61CEoSAlIAHQDtULcNNxrhd4lyccfDsbGG0LAbc2klJUMdiSRgj3zVx8bp4ttx+FS8pqWqjKkRui9EsaTZdcU9+KuMgAPSNm0ADohA/SkenfvRYOlLArNOY8cccVGCpISnOWSTnN22Q2odOs6ijtMPSpTCG1bv7uvbu47+tQLMleiXo0CfIadtr6VlqQhgNqQtI3FKkp4Py87uOlG9CuutNP6mtaI0VTaH0PJWFOdk4IOPsfvitYvmpdEi+eRpZ7WrVrbd3vG5yK6SqLAVw2lsn5VLH61HGeeBxxRk00hhpDTSEobQAlKUjAAHYCvEVkR2ENJACUJCRgYGAPSt1C3bI3YqVKlU4IKlSpUIIqyKVKrLEetYpUqhYhXqlSqiGD0rzSpVZBFIPHOPrXkMNf+mg//ABFKlUS5APaUJQMJAA9B0rJpUqn0jErpXilSqER6pUqVWWKlSpVTIhUqVKoi0KlSpVZZ/9k=";
  var FOLD_KEY = 'kaoyan.polPet.fold.v1';
  var POS_KEY = 'kaoyan.polPet.pos.v1';
  var HEARTS = ['💗', '💖', '💕', '💞', '💓', '✨'];
  var BUBBLES = ['mua~ 💗', '啵唧~ 💕', '贴贴 💗', '亲亲 💖', '么么哒 💞', '好甜呀 ✨', '一起上岸 💗', '政治必胜 💕'];

  var css = [
    '.op-pet{position:fixed;right:18px;bottom:20px;z-index:46;user-select:none;-webkit-user-select:none;touch-action:none;font-family:-apple-system,"PingFang SC","Noto Sans SC",sans-serif;}',
    '.op-pet.above-hud{bottom:68px;}',
    /* 直接给容器设干净底色，彻底避免 iOS Safari / 微信 WebView 下 backdrop-filter 伪元素盖住动画图片 */
    '.op-pet-stage{position:relative;display:flex;align-items:center;justify-content:center;gap:6px;padding:7px 10px;border-radius:999px;background:rgba(255,248,252,.95);border:1.5px solid rgba(244,114,182,.4);box-shadow:0 8px 24px -10px rgba(236,72,153,.38),0 2px 8px rgba(0,0,0,.08);cursor:grab;transition:box-shadow .22s ease,border-color .22s ease;}',
    '.op-pet-stage:active{cursor:grabbing;}',
    ':root[data-theme="dark"] .op-pet-stage{background:rgba(28,24,32,.93);border-color:rgba(244,114,182,.42);}',
    '.op-pet:hover .op-pet-stage,.op-pet.is-kiss .op-pet-stage{border-color:rgba(244,114,182,.75);box-shadow:0 10px 28px -8px rgba(244,114,182,.5),0 2px 10px rgba(0,0,0,.09);}',

    '.op-pet-char{position:relative;z-index:2;width:58px;height:58px;border-radius:50%;flex:0 0 auto;}',
    '.op-pet-char img{position:relative;z-index:1;display:block;width:100%;height:100%;max-width:none;object-fit:cover;border-radius:50%;background:#fff;border:2.5px solid #fff;box-shadow:0 3px 10px rgba(219,39,119,.22),0 1px 4px rgba(0,0,0,.14);pointer-events:none;-webkit-user-drag:none;-webkit-touch-callout:none;}',
    ':root[data-theme="dark"] .op-pet-char img{border-color:#fce7f3;}',

    /* 腮红 */
    '.op-pet-blush{position:absolute;z-index:2;bottom:13px;width:10px;height:5px;border-radius:50%;background:rgba(255,94,148,.6);filter:blur(1.4px);opacity:.18;pointer-events:none;transition:opacity .28s ease,transform .28s ease;}',
    '.op-pet-blush.bl{left:7px;}',
    '.op-pet-blush.br{right:7px;}',
    '.op-pet.is-kiss .op-pet-blush,.op-pet.is-nuzzle .op-pet-blush,.op-pet:hover .op-pet-blush{opacity:.82;transform:scale(1.15);}',

    /* 待机轻轻晃悠 */
    '.op-pet-char.is-l{animation:opPetBobL 2.8s ease-in-out infinite;}',
    '.op-pet-char.is-r{animation:opPetBobR 2.8s ease-in-out infinite;}',
    '@keyframes opPetBobL{0%,100%{transform:translateY(0) rotate(-3deg);}50%{transform:translateY(-3px) rotate(3deg);}}',
    '@keyframes opPetBobR{0%,100%{transform:translateY(-1px) rotate(3deg);}50%{transform:translateY(-4px) rotate(-3deg);}}',

    /* 亲亲动作：两人向中间倾身贴脸 + Q弹 */
    '.op-pet.is-kiss .op-pet-char.is-l{animation:opPetKissL 1.35s cubic-bezier(.34,1.45,.64,1) forwards;}',
    '.op-pet.is-kiss .op-pet-char.is-r{animation:opPetKissR 1.35s cubic-bezier(.34,1.45,.64,1) forwards;}',
    '@keyframes opPetKissL{0%{transform:translate(0,0) rotate(-3deg) scale(1);}24%{transform:translate(10px,-2px) rotate(13deg) scale(1.06,.95);}46%{transform:translate(12px,-3px) rotate(15deg) scale(1.08,.94);}66%{transform:translate(9px,-2px) rotate(11deg) scale(1.05,.97);}84%{transform:translate(-2px,-4px) rotate(-5deg) scale(.97,1.04);}100%{transform:translate(0,0) rotate(-3deg) scale(1);}}',
    '@keyframes opPetKissR{0%{transform:translate(0,-1px) rotate(3deg) scale(1);}24%{transform:translate(-10px,-2px) rotate(-13deg) scale(1.06,.95);}46%{transform:translate(-12px,-3px) rotate(-15deg) scale(1.08,.94);}66%{transform:translate(-9px,-2px) rotate(-11deg) scale(1.05,.97);}84%{transform:translate(2px,-4px) rotate(5deg) scale(.97,1.04);}100%{transform:translate(0,-1px) rotate(3deg) scale(1);}}',

    /* 贴贴蹭蹭动作 */
    '.op-pet.is-nuzzle .op-pet-char.is-l{animation:opPetNuzL 1.25s ease-in-out forwards;}',
    '.op-pet.is-nuzzle .op-pet-char.is-r{animation:opPetNuzR 1.25s ease-in-out forwards;}',
    '@keyframes opPetNuzL{0%,100%{transform:translate(0,0) rotate(-2deg);}22%{transform:translate(7px,-2px) rotate(8deg);}42%{transform:translate(9px,-4px) rotate(12deg);}62%{transform:translate(6px,-1px) rotate(6deg);}80%{transform:translate(8px,-3px) rotate(10deg);}}',
    '@keyframes opPetNuzR{0%,100%{transform:translate(0,0) rotate(2deg);}22%{transform:translate(-7px,-3px) rotate(-10deg);}42%{transform:translate(-9px,-1px) rotate(-6deg);}62%{transform:translate(-6px,-4px) rotate(-12deg);}80%{transform:translate(-8px,-2px) rotate(-8deg);}}',

    /* 中间跳动小爱心 */
    '.op-pet-heart{position:absolute;left:50%;top:-4px;z-index:4;transform:translateX(-50%) scale(.92);font-size:17px;line-height:1;pointer-events:none;filter:drop-shadow(0 2px 5px rgba(236,72,153,.45));animation:opHeartIdle 1.8s ease-in-out infinite;}',
    '.op-pet.is-kiss .op-pet-heart{animation:opHeartPop 1.35s ease forwards;}',
    '@keyframes opHeartIdle{0%,100%{transform:translateX(-50%) scale(.88);}50%{transform:translateX(-50%) scale(1.06);}}',
    '@keyframes opHeartPop{0%{transform:translateX(-50%) scale(.9);}30%{transform:translateX(-50%) translateY(-5px) scale(1.48);}55%{transform:translateX(-50%) translateY(-3px) scale(1.2);}75%{transform:translateX(-50%) translateY(-6px) scale(1.42);}100%{transform:translateX(-50%) scale(.92);}}',

    /* 飘起的爱心与泡泡层 */
    '.op-pet-fx{position:absolute;left:50%;bottom:54px;width:0;height:0;pointer-events:none;z-index:6;}',
    '.op-pet-fh{position:absolute;left:0;top:0;font-size:15px;line-height:1;opacity:0;animation:opFloatHeart var(--dur,1.25s) ease-out forwards;}',
    '@keyframes opFloatHeart{0%{opacity:0;transform:translate(-50%,6px) scale(.45) rotate(0deg);}18%{opacity:1;transform:translate(calc(-50% + var(--dx,0px)*0.3),-12px) scale(var(--sc,1.1)) rotate(var(--rot,8deg));}100%{opacity:0;transform:translate(calc(-50% + var(--dx,0px)),var(--dy,-58px)) scale(.75) rotate(var(--rot2,16deg));}}',
    '.op-pet-bub{position:absolute;left:0;top:-8px;transform:translate(-50%,0);white-space:nowrap;padding:3px 9px;border-radius:999px;background:rgba(255,245,250,.96);border:1px solid rgba(244,114,182,.45);color:#be185d;font-size:11.5px;font-weight:600;letter-spacing:.02em;box-shadow:0 4px 12px rgba(236,72,153,.2);opacity:0;animation:opBubPop 1.45s ease-out forwards;}',
    ':root[data-theme="dark"] .op-pet-bub{background:rgba(40,22,34,.94);color:#f9a8d4;border-color:rgba(244,114,182,.5);}',
    '@keyframes opBubPop{0%{opacity:0;transform:translate(-50%,6px) scale(.75);}18%{opacity:1;transform:translate(-50%,-10px) scale(1.03);}72%{opacity:1;transform:translate(-50%,-18px) scale(1);}100%{opacity:0;transform:translate(-50%,-28px) scale(.94);}}',

    /* 收起按钮 */
    '.op-pet-min{position:absolute;top:-6px;right:-4px;z-index:5;width:20px;height:20px;padding:0;border:1px solid rgba(244,114,182,.45);border-radius:50%;background:rgba(255,255,255,.96);color:#9d4d70;font-size:13px;line-height:18px;text-align:center;cursor:pointer;opacity:0;transform:scale(.85);transition:opacity .18s,transform .18s,background .15s,color .15s;box-shadow:0 2px 6px rgba(0,0,0,.1);}',
    '.op-pet:hover .op-pet-min,.op-pet:focus-within .op-pet-min{opacity:1;transform:scale(1);}',
    '.op-pet-min:hover{background:#f472b6;color:#fff;border-color:#f472b6;}',
    ':root[data-theme="dark"] .op-pet-min{background:rgba(34,24,32,.92);color:#f9a8d4;}',

    /* 收起态小爱心胶囊 */
    '.op-pet-pill{display:none;align-items:center;gap:5px;height:36px;padding:0 12px 0 9px;border:1px solid rgba(244,114,182,.45);border-radius:999px;background:rgba(255,248,252,.95);color:#be185d;font-size:12.5px;font-weight:600;cursor:pointer;box-shadow:0 6px 18px rgba(236,72,153,.24);transition:transform .16s,box-shadow .16s;}',
    '.op-pet-pill:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(236,72,153,.35);}',
    ':root[data-theme="dark"] .op-pet-pill{background:rgba(36,24,32,.94);color:#f9a8d4;}',
    '.op-pet.is-folded .op-pet-stage{display:none;}',
    '.op-pet.is-folded .op-pet-pill{display:inline-flex;}',

    '@media (max-width:720px){.op-pet{right:10px;bottom:14px;}.op-pet.above-hud{bottom:54px;}.op-pet-char{width:48px;height:48px;}.op-pet-stage{padding:6px 8px;gap:5px;}.op-pet-heart{font-size:15px;}.op-pet-min{opacity:.9;transform:scale(1);width:18px;height:18px;font-size:12px;line-height:16px;}}',
    '@media (prefers-reduced-motion:reduce){.op-pet-char,.op-pet-heart{animation:none !important;}}',
    '@media print{.op-pet{display:none !important;}}'
  ].join('');

  var st = document.createElement('style');
  st.id = 'opCouplePetStyle';
  st.textContent = css;
  document.head.appendChild(st);

  var root = document.createElement('div');
  root.id = 'opCouplePet';
  root.className = 'op-pet';
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', '政治一页纸双人小宠物');
  root.innerHTML =
    '<div class="op-pet-stage" title="点一下亲亲 💗 · 可拖动位置">' +
      '<div class="op-pet-fx" aria-hidden="true"></div>' +
      '<div class="op-pet-char is-l">' +
        '<img alt="小宠物左" draggable="false">' +
        '<span class="op-pet-blush bl"></span><span class="op-pet-blush br"></span>' +
      '</div>' +
      '<span class="op-pet-heart" aria-hidden="true">💗</span>' +
      '<div class="op-pet-char is-r">' +
        '<img alt="小宠物右" draggable="false">' +
        '<span class="op-pet-blush bl"></span><span class="op-pet-blush br"></span>' +
      '</div>' +
      '<button class="op-pet-min" type="button" title="收起小宠物" aria-label="收起小宠物">×</button>' +
    '</div>' +
    '<button class="op-pet-pill" type="button" title="呼出亲亲小宠物" aria-label="呼出亲亲小宠物"><span>💗</span><span>贴贴</span></button>';

  var imgs = root.querySelectorAll('.op-pet-char img');
  imgs[0].src = IMG_A;
  imgs[1].src = IMG_B;

  function syncHudOffset() {
    if (!root.style.left) {
      root.classList.toggle('above-hud', !!document.querySelector('.quiz-hud'));
    }
  }

  document.body.appendChild(root);
  syncHudOffset();
  setTimeout(syncHudOffset, 150);

  var stage = root.querySelector('.op-pet-stage');
  var fx = root.querySelector('.op-pet-fx');
  var minBtn = root.querySelector('.op-pet-min');
  var pillBtn = root.querySelector('.op-pet-pill');

  var folded = false;
  try { folded = localStorage.getItem(FOLD_KEY) === '1'; } catch (e) {}
  function setFolded(v, persist) {
    folded = !!v;
    root.classList.toggle('is-folded', folded);
    if (persist) { try { localStorage.setItem(FOLD_KEY, folded ? '1' : '0'); } catch (e) {} }
  }
  setFolded(folded, false);

  function clampPos(left, top) {
    var r = root.getBoundingClientRect();
    var w = r.width || 140;
    var h = r.height || 80;
    var maxX = Math.max(8, window.innerWidth - w - 8);
    var maxY = Math.max(8, window.innerHeight - h - 8);
    return {
      left: Math.min(maxX, Math.max(8, left)),
      top: Math.min(maxY, Math.max(8, top))
    };
  }

  function applyPos(left, top) {
    var p = clampPos(left, top);
    root.style.left = p.left + 'px';
    root.style.top = p.top + 'px';
    root.style.right = 'auto';
    root.style.bottom = 'auto';
  }

  try {
    var saved = JSON.parse(localStorage.getItem(POS_KEY) || 'null');
    if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
      requestAnimationFrame(function () { applyPos(saved.x, saved.y); });
    }
  } catch (e) {}

  window.addEventListener('resize', function () {
    if (root.style.left) {
      applyPos(parseFloat(root.style.left) || 12, parseFloat(root.style.top) || 12);
    }
  });

  function spawnHeart(delayMs, big) {
    setTimeout(function () {
      var el = document.createElement('span');
      el.className = 'op-pet-fh';
      el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
      var dx = (Math.random() - 0.5) * (big ? 78 : 52);
      var dy = -(44 + Math.random() * (big ? 36 : 24));
      var rot = (Math.random() - 0.5) * 32;
      el.style.setProperty('--dx', dx.toFixed(1) + 'px');
      el.style.setProperty('--dy', dy.toFixed(1) + 'px');
      el.style.setProperty('--rot', rot.toFixed(1) + 'deg');
      el.style.setProperty('--rot2', (rot * 1.6).toFixed(1) + 'deg');
      el.style.setProperty('--sc', (big ? 1.15 : 0.92) + (Math.random() * 0.25));
      el.style.setProperty('--dur', (1.1 + Math.random() * 0.45).toFixed(2) + 's');
      fx.appendChild(el);
      setTimeout(function () { el.remove(); }, 1650);
    }, delayMs);
  }

  function spawnBubble(text) {
    var old = fx.querySelector('.op-pet-bub');
    if (old) old.remove();
    var b = document.createElement('span');
    b.className = 'op-pet-bub';
    b.textContent = text || BUBBLES[Math.floor(Math.random() * BUBBLES.length)];
    fx.appendChild(b);
    setTimeout(function () { b.remove(); }, 1550);
  }

  var actTimer = 0;
  var idleTimer = 0;
  var kissCount = 0;

  function triggerLove(opts) {
    if (folded) return;
    opts = opts || {};
    var mode = opts.mode || (Math.random() < 0.72 ? 'kiss' : 'nuzzle');
    var cls = mode === 'kiss' ? 'is-kiss' : 'is-nuzzle';
    root.classList.remove('is-kiss', 'is-nuzzle');
    void root.offsetWidth;
    root.classList.add(cls);

    var n = opts.big ? 6 : (mode === 'kiss' ? 4 : 3);
    for (var i = 0; i < n; i++) spawnHeart(i * 95, !!opts.big);
    if (opts.bubble || mode === 'kiss') {
      spawnBubble(opts.text || (mode === 'nuzzle' ? '贴贴蹭蹭 💕' : undefined));
    }

    clearTimeout(actTimer);
    actTimer = setTimeout(function () {
      root.classList.remove('is-kiss', 'is-nuzzle');
    }, 1400);
  }

  function scheduleNext() {
    clearTimeout(idleTimer);
    var wait = 5200 + Math.floor(Math.random() * 3400);
    idleTimer = setTimeout(function () {
      if (!folded && !document.hidden) triggerLove();
      scheduleNext();
    }, wait);
  }

  /* 拖拽 + 点击触发亲亲 */
  var dragging = false;
  var moved = false;
  var startX = 0, startY = 0, origL = 0, origT = 0;

  stage.addEventListener('pointerdown', function (e) {
    if (e.target.closest('.op-pet-min')) return;
    dragging = true;
    moved = false;
    var r = root.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    origL = r.left;
    origT = r.top;
    if (stage.setPointerCapture) {
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    }
  });

  stage.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    if (!moved && Math.hypot(dx, dy) < 5) return;
    moved = true;
    applyPos(origL + dx, origT + dy);
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    if (moved) {
      var r = root.getBoundingClientRect();
      try { localStorage.setItem(POS_KEY, JSON.stringify({ x: Math.round(r.left), y: Math.round(r.top) })); } catch (err) {}
    } else {
      kissCount++;
      var special = kissCount % 5 === 0 ? '亲亲暴击 💗💗' : undefined;
      triggerLove({ mode: 'kiss', big: true, bubble: true, text: special });
      scheduleNext();
    }
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  minBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    setFolded(true, true);
  });

  pillBtn.addEventListener('click', function () {
    setFolded(false, true);
    requestAnimationFrame(function () {
      if (root.style.left) {
        applyPos(parseFloat(root.style.left) || 12, parseFloat(root.style.top) || 12);
      }
      triggerLove({ mode: 'kiss', big: true, bubble: true, text: '回来贴贴啦 💗' });
      scheduleNext();
    });
  });

  /* 初次进来 1.4 秒先打个招呼亲一口 */
  setTimeout(function () {
    if (!folded && !document.hidden) {
      triggerLove({ mode: 'kiss', bubble: true, text: 'mua~ 💗' });
    }
    scheduleNext();
  }, 1400);
})();
