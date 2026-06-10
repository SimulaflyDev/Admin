Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("D:\adminpanel\adminpanel\Guide\Thought for 33s.docx")
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$text = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()
$text = $text -replace '<[^>]+>', "`n"
Set-Content -Path "D:\adminpanel\adminpanel\Guide\Thought for 33s.txt" -Value $text
