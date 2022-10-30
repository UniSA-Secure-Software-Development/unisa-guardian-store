import os
import random
number=random.randint(1,100)
os.system("./xray webscan --basic-crawler http://localhost:3000/ --html-output {0}test.html".format(number))