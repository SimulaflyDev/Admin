$text = Get-Content "D:\adminpanel\adminpanel\Guide\Thought for 33s.txt" -Raw
if ($text.Length -gt 4000) {
    Write-Output $text.Substring(0, 4000)
} else {
    Write-Output $text
}
