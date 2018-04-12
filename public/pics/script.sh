#!/bin/bash
if [ $# -eq 0 ]; then
	echo "Donne le nom du dossier.";
	exit 1;
fi
i=0
for file in ./$1/*; do
	echo "$file -> ./'$1'/'$i'-cp.jpg";
	mv $file './'$1'/'$i'-cp.jpg'; 
	let i++;
done
i=0
for file in ./$1/*; do
	echo "$file -> ./'$1'/'$i'.jpg";
	mv $file ./$1/$i.jpg; 
	let i++;
done
