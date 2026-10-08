$base = "http://localhost:8000/api"

Write-Host "=== 1. REGISTER ==="
$body = @{username='alice'; email='alice@example.com'; password='pass123'} | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Uri "$base/auth/register" -Method Post -Body $body -ContentType 'application/json'
    Write-Host "OK: User $($r.username), id=$($r.id), points=$($r.points)"
} catch {
    $msg = $_.Exception.Message
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $msg = $reader.ReadToEnd()
    } catch {}
    Write-Host "ERROR: $msg"
}

Write-Host ""
Write-Host "=== 2. LOGIN ==="
$body = @{username='alice'; password='pass123'} | ConvertTo-Json
$token = $null
try {
    $r = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -Body $body -ContentType 'application/json'
    $token = $r.access_token
    Write-Host "OK: Token received ($($token.Length) chars)"
} catch {
    $msg = $_.Exception.Message
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $msg = $reader.ReadToEnd()
    } catch {}
    Write-Host "ERROR: $msg"
}

$headers = @{ Authorization = "Bearer $token" }

Write-Host ""
Write-Host "=== 3. GET /auth/me ==="
try {
    $r = Invoke-RestMethod -Uri "$base/auth/me" -Headers $headers
    Write-Host "OK: $($r.username), points=$($r.points), slots=$($r.task_slots)"
} catch {
    $msg = $_.Exception.Message
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $msg = $reader.ReadToEnd()
    } catch {}
    Write-Host "ERROR: $msg"
}

Write-Host ""
Write-Host "=== 4. CREATE TASK TEMPLATE ==="
$body = @{title='Пробежать 3 км'; description='Утренняя пробежка'; category='habits'} | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Uri "$base/tasks/templates" -Method Post -Body $body -Headers $headers -ContentType 'application/json'
    Write-Host "OK: Template id=$($r.id), title=$($r.title)"
    $templateId = $r.id
} catch {
    $msg = $_.Exception.Message
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $msg = $reader.ReadToEnd()
    } catch {}
    Write-Host "ERROR: $msg"
}

Write-Host ""
Write-Host "=== 5. GET TASK TEMPLATES ==="
try {
    $r = Invoke-RestMethod -Uri "$base/tasks/templates" -Headers $headers
    Write-Host "OK: $($r.Count) templates"
    $r | ForEach-Object { Write-Host "   - [$($_.id)] $($_.title) (cat: $($_.category))" }
} catch {
    $msg = $_.Exception.Message
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $msg = $reader.ReadToEnd()
    } catch {}
    Write-Host "ERROR: $msg"
}

Write-Host ""
Write-Host "=== 6. CREATE USER TASK ==="
$body = @{title='Пробежать 3 км сегодня'; description='Задание на сегодня'; category='habits'; bid_amount=100; template_id=$templateId} | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Uri "$base/tasks/my-tasks" -Method Post -Body $body -Headers $headers -ContentType 'application/json'
    Write-Host "OK: Task id=$($r.id), bid=$($r.bid_amount)"
    $taskId = $r.id
} catch {
    $msg = $_.Exception.Message
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $msg = $reader.ReadToEnd()
    } catch {}
    Write-Host "ERROR: $msg"
}

Write-Host ""
Write-Host "=== 7. GET MY TASKS ==="
try {
    $r = Invoke-RestMethod -Uri "$base/tasks/my-tasks" -Headers $headers
    Write-Host "OK: $($r.Count) tasks"
    $r | ForEach-Object { Write-Host "   - [$($_.id)] $($_.title) | completed: $($_.is_completed) | bid: $($_.bid_amount)" }
} catch {
    $msg = $_.Exception.Message
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $msg = $reader.ReadToEnd()
    } catch {}
    Write-Host "ERROR: $msg"
}

Write-Host ""
Write-Host "=== 8. COMPLETE TASK ==="
try {
    $r = Invoke-RestMethod -Uri "$base/tasks/my-tasks/$taskId/complete" -Method Put -Headers $headers
    Write-Host "OK: Task completed! streak=$($r.streak_count)"
} catch {
    $msg = $_.Exception.Message
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $msg = $reader.ReadToEnd()
    } catch {}
    Write-Host "ERROR: $msg"
}

Write-Host ""
Write-Host "=== 9. CHECK BALANCE AFTER COMPLETE ==="
try {
    $r = Invoke-RestMethod -Uri "$base/auth/me" -Headers $headers
    Write-Host "OK: points now = $($r.points), earned total = $($r.total_earned_points), streak=$($r.streak_count)"
} catch {
    $msg = $_.Exception.Message
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $msg = $reader.ReadToEnd()
    } catch {}
    Write-Host "ERROR: $msg"
}

Write-Host ""
Write-Host "=== 10. BANK INFO ==="
try {
    $r = Invoke-RestMethod -Uri "$base/bank/" -Headers $headers
    Write-Host "OK: bank total_points = $($r.total_points)"
} catch {
    $msg = $_.Exception.Message
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $msg = $reader.ReadToEnd()
    } catch {}
    Write-Host "ERROR: $msg"
}

Write-Host ""
Write-Host "=== 11. BANK STATUS ==="
try {
    $r = Invoke-RestMethod -Uri "$base/bank/status" -Headers $headers
    Write-Host "OK: total=$($r.total_points), daily_tx=$($r.daily_transactions), weekly_distrib=$($r.weekly_distributions)"
} catch {
    $msg = $_.Exception.Message
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $msg = $reader.ReadToEnd()
    } catch {}
    Write-Host "ERROR: $msg"
}

Write-Host ""
Write-Host "=== 12. UPDATE RANKINGS ==="
try {
    $r = Invoke-RestMethod -Uri "$base/rankings/update" -Headers $headers
    Write-Host "OK: $($r.message), ts=$($r.timestamp)"
} catch {
    $msg = $_.Exception.Message
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $msg = $reader.ReadToEnd()
    } catch {}
    Write-Host "ERROR: $msg"
}

Write-Host ""
Write-Host "=== 13. LEADERBOARD (POINTS) ==="
try {
    $r = Invoke-RestMethod -Uri "$base/rankings/leaderboard/points"
    Write-Host "OK: type=$($r.ranking_type), participants=$($r.total_participants)"
    $r.entries | ForEach-Object { Write-Host "   #$($_.rank_position) $($_.username) = $($_.value)" }
} catch {
    $msg = $_.Exception.Message
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $msg = $reader.ReadToEnd()
    } catch {}
    Write-Host "ERROR: $msg"
}

Write-Host ""
Write-Host "=== 14. MY RANKINGS ==="
try {
    $r = Invoke-RestMethod -Uri "$base/rankings/my" -Headers $headers
    Write-Host "OK: overall_rank=$($r.overall_rank), points=$($r.points), streak_count=$($r.streak_count)"
} catch {
    $msg = $_.Exception.Message
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $msg = $reader.ReadToEnd()
    } catch {}
    Write-Host "ERROR: $msg"
}

Write-Host ""
Write-Host "=== ALL TESTS DONE ==="
