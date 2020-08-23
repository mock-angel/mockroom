pre_text = " .ContentPresets > * "

back_text = "} \n #ContentPresets > * "
content = ""
with open("main.sass", "r") as file1:
  content =  "" + file1.read().replace("}", "\n}").replace(".", pre_text + ".") + "\n}" 
  with open("main.css", "w") as file2:
    file2.write(content)
